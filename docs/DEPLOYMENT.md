# Deployment and portfolio checklist

This branch addresses public role escalation, request ownership, role/state authorization and wildcard CORS. It is a portfolio demo, not a completed production SAP access-governance system.

## Transition from the original project

The application is now named **T-Code Access System for SAP Users**. The API is `/api/tcode-requests`, the model is `TCodeRequest`, and new records use the `tcode_requests` collection. Old invoice data is left in its original collection; do not relabel financial records as SAP access requests. Back up existing data and start new requests with verified SAP identities. Deploy frontend and backend together because old invoice URLs are no longer served. Existing accounts can be reused after their roles and organization memberships are verified.

## Deploy the API

- Use Node.js 24 (or a version satisfying both package engine requirements).
- Set the service root to `backend`, install with `npm ci --omit=dev`, start with `npm start`.
- Set `MONGO_URI`, a random `JWT_SECRET` of at least 32 characters, and `CORS_ORIGINS` to your exact HTTPS frontend origin(s), comma separated with no trailing slashes. Set `PORT` if the host requires it.
- The API starts listening only after MongoDB connects. `/health` is a basic process health endpoint, not a continuous database readiness probe.
- Rotate any database passwords/JWT secrets that were previously committed or shared. Removing `.env` in a later commit does not revoke historical credentials. Do not paste secret values into issues or pull requests.

## Trusted account and organization setup

Public signup always creates an unassigned creator. `companyName` is a display label and does not grant access to an organization. There is intentionally no public role/organization management endpoint.

Before enabling approvals, a trusted database administrator must:

1. Back up the database and review existing users, especially any privileged users created before this fix. Reset unverified reviewer roles to `creator`.
2. Generate one MongoDB ObjectId per real organization and assign the same `organizationId` to verified members in `users` using their exact `_id`. Assign reviewer roles (`manager`, `finance`, `director`) only after verifying the person and organization. Do not infer membership from a self-entered company name.
3. Review legacy requests individually. Their organization defaults to null and reviewers cannot access them. Assign an organization only after verifying the request owner belongs to it. Prefer returning unverified pending records to draft and clearing their old approvals for a fresh review. Never bulk-assign all records to one organization just to unblock the UI.
4. Provision members before creating new demo requests. Existing unassigned drafts also require verified organization backfill before submission. Reassigning a user does not automatically move existing requests between organizations.
5. Sign out and back in after role changes to refresh the UI. The API checks the current database role on every request, so stored UI role values cannot grant access.

Creators can read their own requests in any state and edit/delete/submit only their own drafts. Reviewers can list/read/approve/reject only requests in their assigned organization at their current stage; they cannot review requests they own. Each transition checks state in the same database write. Rejection clears the current approval chain and returns to draft. A separate immutable audit log remains future work.

## Deploy the frontend

- Use root `frontend`, install with `npm ci`, build with `npm run build`, publish `dist`.
- Set `VITE_API_URL` to the API HTTPS origin **before building**. It defaults to `http://localhost:5000` for development. Rebuild after changes.
- Preserve the SPA rewrite in `frontend/vercel.json` for direct navigation.
- Deploy API and frontend from the same reviewed branch/commit. Verify actual host configuration before treating the previous URLs as working demos.

## Release and portfolio verification

- Run backend `npm test` and frontend `npm run build`. Tests use an isolated temporary MongoDB database; the first run downloads a MongoDB executable. They never connect to `MONGO_URI` or the deployed database. An existing compatible binary can be supplied with `MONGOMS_SYSTEM_BINARY`.
- Complete a browser smoke test against staging with fictional data: register, login, create/edit, submit, all three approvals, reject/resubmit, print, mobile layout, and access-denied messages.
- Capture desktop/mobile screenshots and a short workflow video after staging works. Add the verified demo URL and screenshots to README, then use the project as an Upwork portfolio item.
- Suggested portfolio description: “Built a SAP T-code access-request portal with Vue, Express and MongoDB, JWT authentication, owner-restricted drafts, organization-scoped review queues, and a three-stage approval workflow.” Do not claim SAP provisioning integration or production readiness.

## Still required before real SAP access requests

- SAP provisioning integration or a documented administrator handoff, expiry enforcement, segregation-of-duties checks, and validation against the actual SAP system/client and T-code catalog. Dates and T-code syntax are validated, but existence and suitability inside SAP are not checked.
- Authentication rate limiting, abuse controls, account recovery, session revocation, and a deliberate browser token-storage policy (currently localStorage).
- Immutable approval/audit history, access-request retention/deletion rules, backups, monitoring and restore testing.
- Verify historical secret exposure and rotate affected credentials; review existing roles, organizations, and past approvals as described above.
- Confirm that the retained Manager → Finance → Director chain matches your SAP access policy. Request numbers are unique per creator.
- Hosted end-to-end testing and accessibility review. A passing API test suite and build do not establish that the live deployment works.
