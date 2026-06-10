import { create } from 'zustand'
import type { Goal } from '../types'

interface GoalState {
  goals:        Goal[]
  activeGoal:   Goal | null
  setGoals:     (goals: Goal[]) => void
  addGoal:      (goal: Goal) => void
  updateGoal:   (id: string, updates: Partial<Goal>) => void
  removeGoal:   (id: string) => void
  setActive:    (goal: Goal | null) => void
}

export const useGoalStore = create<GoalState>((set) => ({
  goals:      [],
  activeGoal: null,
  setGoals:   (goals)         => set({ goals }),
  addGoal:    (goal)          => set((s) => ({ goals: [...s.goals, goal] })),
  updateGoal: (id, updates)   => set((s) => ({
    goals: s.goals.map(g => g.id === id ? { ...g, ...updates } : g)
  })),
  removeGoal: (id)            => set((s) => ({ goals: s.goals.filter(g => g.id !== id) })),
  setActive:  (goal)          => set({ activeGoal: goal }),
}))
