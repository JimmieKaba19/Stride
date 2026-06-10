import { supabase } from '../supabase'
import type { StreakDay } from '../../types'

export const streaksApi = {
  heatmap: async (goalId: string, days = 91) => {
    const from = new Date()
    from.setDate(from.getDate() - days)
    const { data, error } = await supabase
      .from('streak_days')
      .select('*')
      .eq('goal_id', goalId)
      .gte('date', from.toISOString().split('T')[0])
      .order('date', { ascending: true })
    if (error) throw error
    return data as StreakDay[]
  },

  useFreeze: async (goalId: string, userId: string, date: string) => {
    const { error } = await supabase
      .from('streak_days')
      .upsert({ goal_id: goalId, user_id: userId, date, checked_in: false, freeze_used: true })
    if (error) throw error
  },
}
