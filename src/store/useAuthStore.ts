import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Profile } from '../types'

interface AuthState {
  profile:         Profile | null
  isAuthenticated: boolean
  isLoading:       boolean
  setProfile:      (profile: Profile) => void
  clearAuth:       () => void
  setLoading:      (v: boolean) => void
}

// changing isloading to false by default, since we don't want the app to be in a loading state on initial load. We'll set it to true when we start checking for an existing session, and then set it back to false once we have the result.
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      profile:         null,
      isAuthenticated: false,
      isLoading:       false,
      setProfile:  (profile) => set({ profile, isAuthenticated: true, isLoading: false }),
      clearAuth:   ()        => set({ profile: null, isAuthenticated: false, isLoading: false }),
      setLoading:  (v)       => set({ isLoading: v }),
    }),
    {
      name: 'stride-auth',
      partialize: (s) => ({ profile: s.profile, isAuthenticated: s.isAuthenticated }),
    }
  )
)
