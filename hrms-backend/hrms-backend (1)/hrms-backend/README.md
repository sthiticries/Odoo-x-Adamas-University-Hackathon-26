# HRMS Backend

Uses SQLite -- a local database file, no separate DB service or signup needed.

## Setup
```
npm install
cp .env.example .env
npx prisma migrate dev --name init
npm run dev
```
You should see: `Server on port 5000`. This creates a `dev.db` file in
`prisma/` automatically -- that's your whole database. Keep the terminal
open while testing; closing it stops the server.

## Endpoints
- POST /auth/signup, /auth/login
- GET/PUT /profile/me, PUT /profile/:userId (admin)
- POST /attendance/checkin, /attendance/checkout/:id, GET /attendance/me, /attendance/all (admin)
- POST /leave/apply, GET /leave/me, /leave/all (admin), PUT /leave/:id/review (admin)
- GET /payroll/me, /payroll/all (admin), PUT /payroll/:userId (admin)

All routes except signup/login need header: `Authorization: Bearer <token>`

## Troubleshooting
- **"Failed to fetch" in the frontend** -> the backend isn't reachable. Confirm
  `http://localhost:5000` shows "HRMS API running" in your browser. If not,
  the server isn't running -- check this terminal for errors.
- **Server crashes on a bad request** -> fixed: route errors are caught and
  returned as a normal `500` JSON response instead of killing the process.
- **Want to reset all data** -> stop the server, delete `prisma/dev.db`, then
  run `npx prisma migrate dev --name init` again.
