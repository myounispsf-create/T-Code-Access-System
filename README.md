# T-Code Access System for SAP Users

A full-stack SAP transaction-code access-request and multi-stage approval workflow built with Vue 3, Node.js, Express, and MongoDB.

> **Portfolio / development project.** Includes server-side ownership checks, organization-scoped approvals and automated security regression tests. Use fictional data until the remaining deployment and access-governance requirements in [the deployment guide](docs/DEPLOYMENT.md) are complete.

## Features implemented in the source

- User registration and login using password hashing and JWT
- Request creation, listing, detail view, editing and deletion
- SAP user ID, system and three-digit client
- Requested T-codes, department and business justification
- Temporary or ongoing access with validated start/end dates
- Draft request submission for approval
- Manager → Finance → Director approval workflow
- Approval history with approver and timestamp
- Request rejection and return to draft status
- Frontend route guards for authenticated pages

Approved requests record workflow decisions. Granting or removing access inside SAP requires a separate administrator process or integration; this app does not connect to SAP. The existing Manager → Finance → Director stages are retained and should be reviewed against your access-governance policy.

## Technology stack

| Layer | Technology |
| --- | --- |
| Frontend | Vue 3, Vue Router, Vite, Tailwind CSS |
| API | Node.js, Express |
| Database | MongoDB with Mongoose |
| Authentication | bcryptjs, JSON Web Tokens |

## Project structure

```text
T-Code-Access-System/
├── frontend/             # Vue/Vite application
├── backend/
│   ├── models/           # User and TCodeRequest schemas
│   ├── routes/           # Authentication and request API routes
│   └── server.js         # Express API and MongoDB connection
└── .gitignore
```

## Local development

Requires a supported version of Node.js (the frontend specifies Node.js 22.18+ or 24.12+) and MongoDB.

1. Clone this repository.
2. Install dependencies independently in `backend` and `frontend` using `npm ci`.
3. Create `backend/.env` with the following values (**never commit real credentials**):

```dotenv
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/tcode_access
JWT_SECRET=replace-with-a-random-secret-at-least-32-characters
CORS_ORIGINS=http://localhost:5173
```

4. Run the API from `backend` with `npm start`.
5. Copy `frontend/.env.example` to `frontend/.env` and set `VITE_API_URL` if needed. Run the frontend with `npm run dev`.
6. Run `npm test` in `backend` for database-backed authorization tests and `npm run build` in `frontend` for the production build.

Public accounts are creators. Approvals require trusted organization membership and reviewer provisioning; see [deployment and demo setup](docs/DEPLOYMENT.md).

## API overview

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/tcode-requests`
- `GET /api/tcode-requests/:id`
- `POST /api/tcode-requests`
- `PUT /api/tcode-requests/:id`
- `DELETE /api/tcode-requests/:id`
- `POST /api/tcode-requests/submit/:id`
- `POST /api/tcode-requests/approve/:id`
- `POST /api/tcode-requests/reject/:id`

Authenticated request endpoints require a bearer token. Creators access their own records; reviewers access their assigned organization and approval stage. Only owner drafts can be edited or deleted. Security fields are assigned by the server.

## Security and deployment status

- Public signup always creates a creator; role and organization are never accepted from signup input.
- Request reads and changes enforce ownership or trusted organization/stage scope.
- Workflow transitions use atomic state checks and cannot be overridden by request payloads.
- CORS accepts only configured origins; request size is limited and internal errors are hidden.
- Backend regression tests cover access control, workflow, concurrency and CORS. CI runs tests and the frontend build.
- Remaining work includes SAP provisioning and expiry enforcement, authentication abuse protection, audit retention, historical credential review, and hosted end-to-end verification. See [deployment checklist](docs/DEPLOYMENT.md).

## Data and API changes

The T-code model uses a new `tcode_requests` collection. Existing invoice records remain untouched and are not converted automatically. The former invoice endpoints are removed; deploy the frontend and API together. Request numbers are unique per creator.

## Demo and screenshots

Live deployment and screenshots are pending verification. Use fictional sample data only.

## Developer

Muhammad Younis — Full-Stack Developer

[GitHub profile](https://github.com/myounispsf-create)
