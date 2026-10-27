# Invoice Management System

A full-stack invoice management and multi-stage approval workflow built with Vue 3, Node.js, Express, and MongoDB.

> **Portfolio / development project.** This repository is under active review. The current API has known authorization weaknesses and should **not** be deployed with real customer or financial data until they are resolved.

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
2. Install dependencies independently in `backend` and `frontend` using `npm install`.
3. Create `backend/.env` with the following values (**never commit real credentials**):

```dotenv
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/invoice_app
JWT_SECRET=replace-with-a-long-random-secret
```

4. Run the API from `backend` with `node server.js`.
5. Run the frontend from `frontend` with `npm run dev`.

The frontend/backend API configuration must be checked for the deployment environment. This repository has not yet been verified with a clean end-to-end installation.

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

Authenticated invoice endpoints require a bearer token; **do not assume authorization is currently sufficient**.

## Security work required before production

- Enforce server-side role assignment: public registration currently accepts the requested role.
- Check invoice ownership and/or organizational scope for individual invoice reads, edits and deletes.
- Enforce role/state authorization for invoice creation, submission and modification.
- Restrict CORS to approved origins (remove unconditional wildcard origin).
- Add input validation, safer error handling and authentication rate limiting.
- Add automated authorization and workflow tests; the backend currently has no configured test suite.
- Verify no secrets were exposed in current or historical commits.

## Demo and screenshots

Live deployment and screenshots are pending verification. Use fictional sample data only.

## Developer

Muhammad Younis — Full-Stack Developer

[GitHub profile](https://github.com/myounispsf-create)
