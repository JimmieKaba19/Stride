# Stride build roadmap interactive task board showing completed, active, and upcoming development tasks across three phases

## Phase 1: Core loop

### June · V1 Personal MVP

1. Project setup & Supabase config
   Vite, Tailwind, Supabase, env, schema SQL
2. Auth: login & register
   Email/password via Supabase Auth, profile auto-creation trigger
3. Onboarding: 60-second first goal
   5-step flow: type → name → category → time → done
4. Dashboard: home screen
   Greeting, stats bar, goal cards, streak counter, mission prompt
5. Goal creation: new goal form
   Habit vs milestone, category, target date, check-in time
6. Goal detail screen
   Streak heat map, milestones, check-in log, share button
7. Check-in flow
   Modal: mood (1–5), note, progress update. Streak increment logic
8. Streak engine
   Streak day recording, freeze logic, milestone celebrations
9. Tonight's mission
   Evening prompt, save mission, show on dashboard next morning
10. Weekly review
    5-question Sunday flow, private log, searchable history
11. Goals list page
    All goals, filter by status/category, archive, quick stats

## 1.5: Mood & companion layer

### Late June · Personality

1. Mood capture on check-in
   5-option mood picker with colour and emoji per level
2. Mood-aware greeting & dashboard tone
   Message and accent colour shift based on today's mood score
3. Contextual motivational quotes
   Quotes matched to mood level, warm for low, bold for high
4. Journal prompt on low mood
   Gentle nudge to write when mood is 1 or 2. Private, minimal.
5. Streak grace messaging
   Human language on streak break, not just "0". Freeze surfaced warmly
6. Celebration moments
   Confetti + message + shareable card at 7, 30, 60, 90 day milestones
7. UI colour theming by mood
   Warm amber/terracotta on rough days. Full green on great days.

## Phase 2: Social & growth

### July–Aug · V2

1. Accountability partner pairing
   1-to-1 invite, shared streaks, nudge notifications
2. Stride Circles (3–5 people)
   Group streak, daily check-in together. Unlocked at 30-day streak.
3. Shareable streak card
   Auto-generated card at milestones. LinkedIn/WhatsApp ready.
4. Streak freeze system (UI)
   2 free/month counter, use freeze button, Pro upgrade prompt
5. Email reminders via Resend
   Daily check-in reminder at user's chosen time

## Phase 3: Scale & revenue

### Sept+ · V3

1. Stripe billing, Stride Pro
   $3–5/mo or $25–35/yr. Paywall for partner, circles, analytics
2. Public profile page
   stride.app/username, goals, streaks, milestones. Shareable URL.
3. Mood pattern analytics
   Heat map, consistency graph, which days you check in most
4. Stride Teams (B2B)
   Facilitator dashboard, cohort check-ins, weekly summaries
5. Vercel deployment + custom domain
   Production deploy, env vars, domain config
