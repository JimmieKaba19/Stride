# Stride Tech Stack

### Use the same stack for every project you build

- Stride, 

- OT checklist generator, 

- IR playbook builder, 

- Percival dashboard 

one stack across all of them. You get faster with every project. No context switching. No relearning. Your stack becomes your superpower.

## The stack

This stack is used by companies from solo founders to unicorns. It is learnable fast, deployable in minutes, free until you have real users, and scales to millions without changing anything fundamental.

## Full recommended stack

| Frontend      | React + Vite              | You already know this. Fast dev server, instant builds.         |
| ------------- | ------------------------- | --------------------------------------------------------------- |
| Styling       | Tailwind CSS              | Utility classes, no CSS files, consistent design fast.          |
| Backend       | Supabase                  | Database + auth + API in one. Free tier is generous.            |
| Database      | PostgreSQL (via Supabase) | Built into Supabase. No separate setup needed.                  |
| Auth          | Supabase Auth             | Email + Google login. Free. 5 minutes to implement.             |
| Hosting       | Vercel                    | Deploy from GitHub in 2 minutes. Free tier covers V1.           |
| Notifications | Resend                    | Email reminders. Free for 3,000 emails/month.                   |
| Payments      | Stripe                    | Industry standard. Free until you charge. 2.9% per transaction. |
| State mgmt    | Zustand                   | Simpler than Redux, works perfectly for this app size.          |

## Why not Firebase?

Firebase is the other obvious choice and it's fine. But Supabase gives you a real PostgreSQL database you can query with SQL, an open-source codebase you can self-host if needed, and a pricing model that doesn't suddenly become expensive the moment you grow. Firebase's NoSQL structure also becomes painful when your data relationships get complex and Stride's data (users, goals, check-ins, partners, circles) will get relational quickly.

## Why not Next.js over plain React + Vite?

Next.js is excellent and worth learning but it adds server-side rendering complexity you don't need for V1. Start with React + Vite, which you already know. When you add SEO-important public pages like the public profile feature in V3, you can migrate the relevant parts to Next.js or add it as a layer. Don't learn a new framework while shipping your first product.

## Why each Choice

### React + Vite

**You know it Scales**

You've already built with React. Vite replaces Create React App it's faster, lighter, and the current standard. No learning curve. Just use what you have and get better at it.

**Rule: never learn a new frontend framework while building your first product.****

### Tailwind CSS

**Fast to write Free**

Utility-first CSS means you style directly in JSX — no switching between files. Stride needs a clean, consistent UI. Tailwind makes it fast to build and easy to keep consistent. Every component you build is reusable across all your projects.

**One day to learn. Saves hours on every project after that.****

### Supabase the most important choice

**Free tier Scales to millions**

Supabase replaces your entire backend for V1 and V2. It gives you: a PostgreSQL database, user authentication (email + Google), a real-time API your React app talks to directly, row-level security so users only see their own data, and a dashboard to inspect everything. You write almost no backend code. The free tier supports 50,000 monthly active users you won't outgrow it until you're making real money.

**This is the single biggest productivity multiplier in your stack. Learn it well it serves every project you build.**

### Vercel

**Free 2-min deploy**

Connect your GitHub repo. Every push to main auto-deploys. Your app is live at a real URL in 2 minutes. Custom domain support is free. Preview deployments on every PR. This is the fastest path from "I built something" to "it's on the internet."

**You should be able to show Stride to someone within 24 hours of starting it. Vercel makes that possible.**

### Resend email notifications

**3,000 emails/month free**

Stride needs to remind users to check in and write their daily mission. Resend is the cleanest email API available right now better developer experience than SendGrid, free for your scale, and integrates with Supabase in minutes.

**Don't build notifications without email. Push notifications require a native app. Email works on everything.**

### Stripe payments

**Free until you charge**

Don't add Stripe to V1. Add it when you're ready to charge which is after you have 50+ active users who love the free tier. Stripe is the industry standard, works in Kenya via Stripe Atlas if needed, and has the best documentation of any payment provider. 2.9% + $0.30 per transaction.

**Set it up in V2 not before. Don't add payment complexity before you have users.**

## V1-V3 Journey

The stack evolves as the product evolves. Start with the minimum. Add complexity only when a real problem demands it not before.

### V1: Ship in June

#### React + Vite + Tailwind

Frontend. You know it. Build fast.

#### Supabase database + auth

No backend code. Goals, check-ins, missions stored in PostgreSQL. Email auth only for V1.

#### Vercel hosting

Deployed from GitHub. Free. Live URL to share immediately.

#### Resend check-in reminders

Daily email at the user's chosen time. "Time to check in on your goal." Simple, effective.

### V2: After 50 real users

#### Supabase Realtime

Live updates for partner check-ins and circle activity. Already built into Supabase just enable it.

#### Stripe Pro subscriptions

$3–5/month billing. Stripe Checkout handles the entire payment flow. Connect to Supabase to gate paid features.

#### Google OAuth via Supabase

One-click Google login. Reduces signup friction significantly. Already supported by Supabase toggle it on.

### V3: Sustainable Scalability

#### Next.js migration for public pages

Public profile pages need SEO. Migrate or wrap the public-facing pages in Next.js for server-side rendering.

#### Edge functions via Supabase

For complex server-side logic analytics processing, scheduled jobs, webhook handling. No separate server needed.

#### Analytics PostHog or Plausible

Understand how users actually use Stride. Where they drop off, what features they use most. Both are privacy-first and affordable.
