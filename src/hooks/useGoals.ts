import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { goalsApi } from '../lib/api/goals'
import { useGoalStore } from '../store/useGoalStore'
import { useAuthStore } from '../store/useAuthStore'
import type { Goal } from '../types'

export const useGoals = () => {
  const { profile } = useAuthStore()
  const { setGoals } = useGoalStore()

  return useQuery({
    queryKey: ['goals', profile?.id],
    enabled: !!profile?.id,
    queryFn: async () => {
      const data = await goalsApi.list(profile!.id)
      setGoals(data)
      return data
    },
  })
}

export const useGoal = (id: string) =>
  useQuery({
    queryKey: ['goals', id],
    enabled: !!id,
    queryFn: () => goalsApi.get(id),
  })

export const useCreateGoal = () => {
  const qc = useQueryClient()
  const { addGoal } = useGoalStore()
  const { profile } = useAuthStore()

  return useMutation({
    mutationFn: (data: Partial<Goal>) =>
      goalsApi.create({ ...data, user_id: profile!.id }),
    onSuccess: (goal) => {
      addGoal(goal)
      qc.invalidateQueries({ queryKey: ['goals'] })
    },
  })
}

export const useUpdateGoal = () => {
  const qc = useQueryClient()
  const { updateGoal } = useGoalStore()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Goal> }) =>
      goalsApi.update(id, data),
    onSuccess: (goal) => {
      updateGoal(goal.id, goal)
      qc.invalidateQueries({ queryKey: ['goals'] })
    },
  })
}
