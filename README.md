This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Authentication Flow Separation

This project uses **two completely separate authentication flows**:

### 1. Dashboard/Admin Authentication (`useAuth`)
- Used ONLY for admin/staff dashboard pages and components.
- Stores user info in cookies: `edu_user`, `accessToken`.
- Handles admin/staff login, logout, and session management.
- Should NOT be imported or used in any `/emergency` or public-facing pages.

### 2. Reporter/Emergency Authentication (`useReporterAuth`)
- Used ONLY for public/reporter emergency pages and components.
- Stores user info in cookies: `nadmo_reporter`, `reporterAccessToken`.
- Handles reporter signup, login, logout, and session management.
- Should NOT be imported or used in any `/dashboard` or admin-only pages.

### Best Practices
- **Never mix the two hooks in the same page or component.**
- **Redirects and session checks** should always use the correct hook for the area (dashboard vs. emergency).
- If you need to use both flows in the same browser, use separate browser profiles or incognito windows to avoid session/cookie conflicts.
- For advanced separation, consider using separate axios instances in each hook to avoid global `Authorization` header conflicts.

### Why This Matters
- Prevents accidental privilege escalation or session confusion.
- Ensures a clear boundary between public and admin functionality.
- Makes the codebase easier to maintain and reason about.

**If you add new pages or features, always use the correct authentication hook for the context!**
# nadmo
