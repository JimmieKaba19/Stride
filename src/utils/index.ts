import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow, isPast, isToday, parseISO, startOfWeek } from 'date-fns'

// ─── Tailwind class merging ───────────────────────────────────────────────────
export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs))

// ─── Date helpers ─────────────────────────────────────────────────────────────
export const formatDate       = (d: string) => format(parseISO(d), 'MMM d, yyyy')
export const formatShort      = (d: string) => format(parseISO(d), 'MMM d')
export const formatRelative   = (d: string) => formatDistanceToNow(parseISO(d), { addSuffix: true })
export const isOverdue        = (d: string) => isPast(parseISO(d)) && !isToday(parseISO(d))
export const todayISO         = ()          => format(new Date(), 'yyyy-MM-dd')
export const thisWeekStart    = ()          => format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd')

// ─── Progress ────────────────────────────────────────────────────────────────
export const calcProgress = (completed: number, total: number) =>
  total === 0 ? 0 : Math.round((completed / total) * 100)

// ─── Strings ─────────────────────────────────────────────────────────────────
export const truncate   = (s: string, n: number) => s.length > n ? s.slice(0, n - 1) + '…' : s
export const initials   = (name: string) =>
  name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()

// ─── IDs ─────────────────────────────────────────────────────────────────────
export const generateId = () => Math.random().toString(36).slice(2, 11)

// ─── Goal category helper ─────────────────────────────────────────────────────
import { GOAL_CATEGORIES } from '../constants'
export const getCategoryConfig = (value: string) =>
  GOAL_CATEGORIES.find(c => c.value === value) ?? GOAL_CATEGORIES[5]
