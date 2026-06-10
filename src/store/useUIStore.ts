import { create } from 'zustand'

interface UIState {
  sidebarOpen:    boolean
  checkInOpen:    boolean
  missionOpen:    boolean
  toggleSidebar:  () => void
  openCheckIn:    () => void
  closeCheckIn:   () => void
  openMission:    () => void
  closeMission:   () => void
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen:   true,
  checkInOpen:   false,
  missionOpen:   false,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  openCheckIn:   () => set({ checkInOpen: true }),
  closeCheckIn:  () => set({ checkInOpen: false }),
  openMission:   () => set({ missionOpen: true }),
  closeMission:  () => set({ missionOpen: false }),
}))
