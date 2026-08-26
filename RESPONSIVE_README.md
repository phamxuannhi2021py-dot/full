# CareerTwin responsive pass

This build keeps the original full-stack backend/database/model and replaces the dashboard layout behavior with a responsive implementation based on the approved Figma dashboard. Shared app/auth/onboarding layouts also receive responsive breakpoints.

Run:

```powershell
npm.cmd install
npx.cmd prisma generate
npx.cmd prisma db push
npm.cmd run db:seed
npm.cmd run dev
```

Open `http://localhost:3000/dashboard`.
