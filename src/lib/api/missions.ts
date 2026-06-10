import { supabase } from '../supabase'
import type { DailyMission } from '../../types'
import { todayISO } from '../../utils'

export const missionsApi = {
  today: async (userId: string) => {
    const { data } = await supabase
      .from('daily_missions')
      .select('*')
      .eq('user_id', userId)
      .eq('date', todayISO())
      .maybeSingle()
    return data as DailyMission | null
  },

  save: async (userId: string, mission: string) => {
    const { data, error } = await supabase
      .from('daily_missions')
      .upsert({ user_id: userId, date: todayISO(), mission })
      .select()
      .single()
    if (error) throw error
    return data as DailyMission
  },

  history: async (userId: string, limit = 30) => {
    const { data, error } = await supabase
      .from('daily_missions')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(limit)
    if (error) throw error
    return data as DailyMission[]
  },
}
