import { supabase } from '../supabase'
import type { CheckIn } from '../../types'
import { todayISO } from '../../utils'

export const checkInsApi = {
  todayForGoal: async (goalId: string, userId: string) => {
    const { data } = await supabase
      .from('check_ins')
      .select('*')
      .eq('goal_id', goalId)
      .eq('user_id', userId)
      .eq('date', todayISO())
      .maybeSingle()
    return data as CheckIn | null
  },

  create: async (payload: Partial<CheckIn>) => {
    const { data, error } = await supabase
      .from('check_ins')
      .insert(payload)
      .select()
      .single()
    if (error) throw error
    return data as CheckIn
  },

  listForGoal: async (goalId: string, limit = 10) => {
    const { data, error } = await supabase
      .from('check_ins')
      .select('*')
      .eq('goal_id', goalId)
      .order('date', { ascending: false })
      .limit(limit)
    if (error) throw error
    return data as CheckIn[]
  },
}
