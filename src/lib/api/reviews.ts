import { supabase } from '../supabase'
import type { WeeklyReview } from '../../types'
import { thisWeekStart } from '../../utils'

export const reviewsApi = {
  thisWeek: async (userId: string) => {
    const { data } = await supabase
      .from('weekly_reviews')
      .select('*')
      .eq('user_id', userId)
      .eq('week_start', thisWeekStart())
      .maybeSingle()
    return data as WeeklyReview | null
  },

  save: async (payload: Partial<WeeklyReview>) => {
    const { data, error } = await supabase
      .from('weekly_reviews')
      .upsert(payload)
      .select()
      .single()
    if (error) throw error
    return data as WeeklyReview
  },

  history: async (userId: string, limit = 12) => {
    const { data, error } = await supabase
      .from('weekly_reviews')
      .select('*')
      .eq('user_id', userId)
      .order('week_start', { ascending: false })
      .limit(limit)
    if (error) throw error
    return data as WeeklyReview[]
  },
}
