import { supabase } from '../supabase'
import type { Goal } from '../../types'

export const goalsApi = {
  list: async (userId: string) => {
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', userId)
      .neq('status', 'archived')
      .order('created_at', { ascending: false })
    if (error) throw error
    return data as Goal[]
  },

  get: async (id: string) => {
    const { data, error } = await supabase
      .from('goals')
      .select('*, milestones(*), check_ins(*)')
      .eq('id', id)
      .single()
    if (error) throw error
    return data
  },

  create: async (payload: Partial<Goal>) => {
    const { data, error } = await supabase
      .from('goals')
      .insert(payload)
      .select()
      .single()
    if (error) throw error
    return data as Goal
  },

  update: async (id: string, payload: Partial<Goal>) => {
    const { data, error } = await supabase
      .from('goals')
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data as Goal
  },

  archive: async (id: string) => {
    const { error } = await supabase
      .from('goals')
      .update({ status: 'archived' })
      .eq('id', id)
    if (error) throw error
  },
}
