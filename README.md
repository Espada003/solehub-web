# SoleHub Web

Frontend for SoleHub — Next.js 14 + Tailwind. Talks to the SoleHub backend over HTTP using Bearer JWTs.

## Setup

You should already have the **backend** (`solehub-api`) running. The frontend connects to it via the API URL set in `.env`.

```bash
# 1. Install
npm install

# 2. Configure
cp .env.example .env
# Edit .env if your backend isn't on http://localhost:4000/api/v1

# 3. Run
npm run dev
```

The site runs at **http://localhost:3000**.

Make sure the backend's CORS config allows `http://localhost:3000` (the default `.env.example` in the backend already does).

## Seeded login credentials

These match the backend seed script:

| Role         | Email                       | Password         |
| ------------ | --------------------------- | ---------------- |
| Super Admin  | admin@solehub.local         | Admin@12345      |
| Staff        | staff@solehub.local         | Staff@12345      |
| Accountant   | accountant@solehub.local    | Accounts@12345   |
| Customer     | customer@solehub.local      | Customer@12345   |

## Routes

| Path                  | Who                              |
| --------------------- | -------------------------------- |
| `/`                   | Public                           |
| `/products`           | Public — list, filter, search    |
| `/products/[id]`      | Public — detail                  |
| `/login`              | Public                           |
| `/register`           | Public                           |
| `/cart`               | Customer                         |
| `/checkout`           | Customer                         |
| `/orders`             | Customer — own orders            |
| `/orders/[id]`        | Customer — detail + pay/cancel   |
| `/profile`            | Any logged-in user               |
| `/me-payroll`         | Staff / Accountant / Super Admin |
| `/admin/products`     | Staff / Super Admin              |
| `/admin/inventory`    | Staff / Super Admin              |
| `/admin/orders`       | Staff / Super Admin              |
| `/admin/users`        | Super Admin                      |
| `/admin/reports`      | Accountant / Super Admin         |
| `/admin/payroll`      | Accountant / Super Admin         |
| `/admin/audit`        | Super Admin                      |

The navbar shows only the links the logged-in user is allowed to use.

## Notes on JWT storage

This app stores tokens in **localStorage** rather than httpOnly cookies. Reasons:

1. The backend uses Bearer tokens in the Authorization header — the same scheme Postman uses.
   Students writing Playwright tests can mirror Postman behaviour by reading the same token from
   localStorage or by injecting headers directly.
2. No backend changes required to support the frontend (cookies would mean adding /auth/login
   response cookies + middleware to read them).

In a production application you'd lean on httpOnly cookies with CSRF protection. For this teaching
project, localStorage is intentional and documented.

## Building for production

```bash
npm run build
npm run start
```
