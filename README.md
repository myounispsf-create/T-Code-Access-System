# Invoice Management System

A full-stack invoice management and multi-stage approval workflow built with Vue 3, Node.js, Express, and MongoDB.

> **Portfolio / development project.** Includes server-side ownership checks, organization-scoped approvals and automated security regression tests. Use fictional data until the remaining deployment and financial-data requirements in [the deployment guide](docs/DEPLOYMENT.md) are complete.

## Features implemented in the source

- User registration and login using password hashing and JWT
- Invoice creation, listing, detail view, editing and deletion
- Customer, shipping, line-item, tax and total fields
- Draft invoice submission for approval
- Manager → Finance → Director approval workflow
- Approval history with approver and timestamp
- Invoice rejection and return to draft status
- Frontend route guards for authenticated pages

## Technology stack

| Layer | Technology |
| --- | --- |
| Frontend | Vue 3, Vue Router, Vite, Tailwind CSS |
| API | Node.js, Express |
| Database | MongoDB with Mongoose |
| Authentication | bcryptjs, JSON Web Tokens |

## Project structure

```text
Invoice-app/
├── frontend/             # Vue/Vite application
├── backend/
│   ├── models/           # User and Invoice schemas
│   ├── routes/           # Authentication and invoice API routes
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
MONGO_URI=mongodb://127.0.0.1:27017/invoice_app
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
- `GET /api/invoices`
- `GET /api/invoices/:id`
- `POST /api/invoices`
- `PUT /api/invoices/:id`
- `DELETE /api/invoices/:id`
- `POST /api/invoices/submit/:id`
- `POST /api/invoices/approve/:id`
- `POST /api/invoices/reject/:id`

Authenticated invoice endpoints require a bearer token. Creators access their own records; reviewers access their assigned organization and approval stage. Only owner drafts can be edited or deleted. Security fields are assigned by the server.

## Security and deployment status

- Public signup always creates a creator; role and organization are never accepted from signup input.
- Invoice reads and changes enforce ownership or trusted organization/stage scope.
- Workflow transitions use atomic state checks and cannot be overridden by invoice payloads.
- CORS accepts only configured origins; request size is limited and internal errors are hidden.
- Backend regression tests cover access control, workflow, concurrency and CORS. CI runs tests and the frontend build.
- Remaining work includes amount validation/calculation, authentication abuse protection, audit retention, historical credential review, and hosted end-to-end verification. See [deployment checklist](docs/DEPLOYMENT.md).

## Demo and screenshots

Live deployment and screenshots are pending verification. Use fictional sample data only.

## Developer

Muhammad Younis — Full-Stack Developer

[GitHub profile](https://github.com/myounispsf-create)
