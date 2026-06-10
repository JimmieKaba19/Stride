import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { checkInsApi } from '../lib/api/checkins'
import { useAuthStore } from '../store/useAuthStore'
import type { CheckIn } from '../types'

export const useTodayCheckIn = (goalId: string) => {
  const { profile } = useAuthStore()
  return useQuery({
    queryKey: ['checkin-today', goalId],
    enabled: !!goalId && !!profile?.id,
    queryFn: () => checkInsApi.todayForGoal(goalId, profile!.id),
  })
}

export const useCreateCheckIn = () => {
  const qc = useQueryClient()
  const { profile } = useAuthStore()

  return useMutation({
    mutationFn: (data: Partial<CheckIn>) =>
      checkInsApi.create({ ...data, user_id: profile!.id }),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['checkin-today', vars.goal_id] })
      qc.invalidateQueries({ queryKey: ['goals'] })
    },
  })
}
