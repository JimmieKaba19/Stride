export const APP_NAME    = 'Stride'
export const APP_TAGLINE = 'Progress that moves with you'
export const APP_VERSION = '0.1.0'

// ─── Routes ───────────────────────────────────────────────────────────────────
export const ROUTES = {
  // Auth
  LOGIN:        '/login',
  REGISTER:     '/register',
  ONBOARDING:   '/onboarding',

  // App
  DASHBOARD:    '/dashboard',
  GOALS:        '/goals',
  GOAL_NEW:     '/goals/new',
  GOAL_DETAIL:  '/goals/:id',
  GOAL_EDIT:    '/goals/:id/edit',
  TASKS:        '/tasks',
  CHECKIN:      '/check-in',
  MISSION:      '/mission',
  REVIEW:       '/review',
  SETTINGS:     '/settings',
  PROFILE:      '/profile',
} as const

// ─── Goal categories ──────────────────────────────────────────────────────────
export const GOAL_CATEGORIES = [
  { value: 'personal',  label: 'Personal',  color: '#8b5cf6', bg: '#f3f0ff' },
  { value: 'work',      label: 'Work',      color: '#3b82f6', bg: '#eff6ff' },
  { value: 'health',    label: 'Health',    color: '#22c55e', bg: '#f0fdf4' },
  { value: 'learning',  label: 'Learning',  color: '#f59e0b', bg: '#fffbeb' },
  { value: 'finance',   label: 'Finance',   color: '#06b6d4', bg: '#ecfeff' },
  { value: 'other',     label: 'Other',     color: '#6b7280', bg: '#f9fafb' },
] as const

// ─── Streak milestones (trigger celebration + shareable card) ─────────────────
export const STREAK_MILESTONES = [7, 14, 30, 60, 90, 180, 365] as const

// ─── Features unlocked by streaks ────────────────────────────────────────────
export const STREAK_UNLOCKS: Record<number, string> = {
  30:  'Accountability partner pairing',
  90:  'Public profile card',
  365: 'Stride Legend badge',
}

// ─── Mood labels ─────────────────────────────────────────────────────────────
export const MOOD_CONFIG = {
  1: { label: 'Rough',     emoji: '😔', color: '#ef4444' },
  2: { label: 'Okay',      emoji: '😐', color: '#f59e0b' },
  3: { label: 'Good',      emoji: '🙂', color: '#84cc16' },
  4: { label: 'Great',     emoji: '😊', color: '#22c55e' },
  5: { label: 'Excellent', emoji: '🔥', color: '#16a34a' },
} as const

// ─── Freeze limits ────────────────────────────────────────────────────────────
export const FREE_FREEZES_PER_MONTH = 2
export const PRO_FREEZES_PER_MONTH  = 10

// ─── Weekly review questions ──────────────────────────────────────────────────
export const REVIEW_QUESTIONS = [
  { key: 'what_done',         prompt: 'What did you accomplish this week?',       placeholder: 'Be honest: big and small wins count.' },
  { key: 'what_skipped',      prompt: 'What did you skip or avoid?',              placeholder: 'No judgment. Just awareness.' },
  { key: 'what_blocked',      prompt: 'What got in the way?',                     placeholder: 'Internal or external: name it.' },
  { key: 'what_learned',      prompt: 'What did you learn about yourself?',       placeholder: 'One sentence is enough.' },
  { key: 'next_week_mission', prompt: "What's your mission for next week?",       placeholder: 'One sentence. Make it count.' },
] as const
