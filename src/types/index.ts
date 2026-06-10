// ─── Auth ─────────────────────────────────────────────────────────────────────
export interface Profile {
  id: string              // matches supabase auth.users.id
  name: string
  email: string
  avatar_url?: string
  timezone: string        // e.g. "Africa/Nairobi"
  onboarded: boolean
  created_at: string
}

// ─── Goals ───────────────────────────────────────────────────────────────────
export type GoalType     = 'habit' | 'milestone'
export type GoalStatus   = 'active' | 'completed' | 'paused' | 'archived'
export type GoalCategory = 'personal' | 'work' | 'health' | 'learning' | 'finance' | 'other'

export interface Goal {
  id: string
  user_id: string
  title: string
  description?: string
  type: GoalType           // habit = daily streak | milestone = progress bar
  category: GoalCategory
  status: GoalStatus
  target_date?: string     // ISO date — required for milestone goals
  checkin_time?: string    // HH:MM — daily reminder time
  current_streak: number
  longest_streak: number
  freeze_count: number     // freezes remaining this month
  progress: number         // 0–100 (milestone goals only)
  created_at: string
  updated_at: string
}

// ─── Milestones (for milestone-type goals) ────────────────────────────────────
export interface Milestone {
  id: string
  goal_id: string
  user_id: string
  title: string
  due_date?: string
  completed: boolean
  completed_at?: string
  sort_order: number
  created_at: string
}

// ─── Streaks ─────────────────────────────────────────────────────────────────
export interface StreakDay {
  id: string
  goal_id: string
  user_id: string
  date: string             // YYYY-MM-DD
  checked_in: boolean
  freeze_used: boolean
  created_at: string
}

// ─── Check-ins ────────────────────────────────────────────────────────────────
export type MoodScore = 1 | 2 | 3 | 4 | 5

export interface CheckIn {
  id: string
  goal_id: string
  user_id: string
  date: string             // YYYY-MM-DD
  note?: string
  mood: MoodScore
  progress_update?: number // new progress % (milestone goals)
  created_at: string
}

// ─── Daily Mission ────────────────────────────────────────────────────────────
export interface DailyMission {
  id: string
  user_id: string
  date: string             // YYYY-MM-DD (the NEXT day this mission is for)
  mission: string
  created_at: string
}

// ─── Weekly Review ────────────────────────────────────────────────────────────
export interface WeeklyReview {
  id: string
  user_id: string
  week_start: string       // YYYY-MM-DD (Monday of the week reviewed)
  what_done: string
  what_skipped: string
  what_blocked: string
  what_learned: string
  next_week_mission: string
  created_at: string
}

// ─── Accountability Partner (V2) ─────────────────────────────────────────────
export interface Partnership {
  id: string
  user_a_id: string
  user_b_id: string
  status: 'pending' | 'active' | 'ended'
  created_at: string
}

// ─── UI / utility types ───────────────────────────────────────────────────────
export interface SelectOption {
  value: string
  label: string
}

export type AsyncStatus = 'idle' | 'loading' | 'success' | 'error'
