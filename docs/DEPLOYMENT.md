# Deployment and portfolio checklist

This branch addresses public role escalation, invoice ownership, role/state authorization and wildcard CORS. It is a portfolio demo, not a completed production financial system.

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
3. Review legacy invoices individually. Their organization defaults to null and reviewers cannot access them. Assign an organization only after verifying the invoice owner belongs to it. Prefer returning unverified pending records to draft and clearing their old approvals for a fresh review. Never bulk-assign all records to one organization just to unblock the UI.
4. Provision members before creating new demo invoices. Existing unassigned drafts also require verified organization backfill before submission. Reassigning a user does not automatically move existing invoices between organizations.
5. Sign out and back in after role changes to refresh the UI. The API checks the current database role on every request, so stored UI role values cannot grant access.

Creators can read their own invoices in any state and edit/delete/submit only their own drafts. Reviewers can list/read/approve/reject only invoices in their assigned organization at their current stage; they cannot review invoices they own. Each transition checks state in the same database write. Rejection clears the current approval chain and returns to draft. A separate immutable audit log remains future work.

## Deploy the frontend

- Use root `frontend`, install with `npm ci`, build with `npm run build`, publish `dist`.
- Set `VITE_API_URL` to the API HTTPS origin **before building**. It defaults to `http://localhost:5000` for development. Rebuild after changes.
- Preserve the SPA rewrite in `frontend/vercel.json` for direct navigation.
- Deploy API and frontend from the same reviewed branch/commit. Verify actual host configuration before treating the previous URLs as working demos.

## Release and portfolio verification

- Run backend `npm test` and frontend `npm run build`. Tests use an isolated temporary MongoDB database; the first run downloads a MongoDB executable. They never connect to `MONGO_URI` or the deployed database. An existing compatible binary can be supplied with `MONGOMS_SYSTEM_BINARY`.
- Complete a browser smoke test against staging with fictional data: register, login, create/edit, submit, all three approvals, reject/resubmit, print, mobile layout, and access-denied messages.
- Capture desktop/mobile screenshots and a short workflow video after staging works. Add the verified demo URL and screenshots to README, then use the project as an Upwork portfolio item.
- Suggested portfolio description: “Built a Vue and Express invoice application with MongoDB, JWT authentication, owner-restricted drafts, organization-scoped review queues, and a three-stage approval workflow.” Do not claim tax compliance or production readiness.

## Still required before real financial data

- Server-side amount calculation, currency/rounding rules, stronger invoice validation, and confirmation of tax behavior (the existing UI subtracts a hard-coded 2% tax).
- Authentication rate limiting, abuse controls, account recovery, session revocation, and a deliberate browser token-storage policy (currently localStorage).
- Immutable approval/audit history, financial retention/deletion rules, backups, monitoring and restore testing.
- Verify historical secret exposure and rotate affected credentials; review existing roles, organizations, and past approvals as described above.
- Tenant-scoped invoice numbering: the current global unique invoice-number index can cause collisions between organizations.
- Hosted end-to-end testing and accessibility review. A passing API test suite and build do not establish that the live deployment works.
