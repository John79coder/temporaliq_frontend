import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

interface OnboardingState {
  currentStep: number
  completedSteps: number[]
  notionConnected: boolean
  calendarConnected: boolean
  selectedDatabaseId: string | null
  selectedCalendarId: string | null

  workspaceId: string | null
  connectedAt: string | null

  // Actions
  setCurrentStep: (step: number) => void
  completeStep: (step: number) => void
  setCalendarConnected: (connected: boolean) => void
  setSelectedDatabase: (id: string | null) => void
  setSelectedCalendar: (id: string | null) => void

  setNotionConnected: (connected: boolean) => void
  setWorkspaceId: (id: string | null) => void
  setConnectedAt: (connectedAt: string | null) => void

  reset: () => void
}

export const useOnboardingStore = create<OnboardingState>()(
  devtools(
    (set) => ({
      currentStep: 1,
      completedSteps: [],
      notionConnected: false,
      calendarConnected: false,
      selectedDatabaseId: null,
      selectedCalendarId: null,
      workspaceId: null,
      connectedAt: null,

      setCurrentStep: (step) => set({ currentStep: step }),

      completeStep: (step) =>
        set((state) => ({
          completedSteps: [...new Set([...state.completedSteps, step])],
        })),

      setNotionConnected: (connected) => set({ notionConnected: connected }),
      setCalendarConnected: (connected) => set({ calendarConnected: connected }),
      setSelectedDatabase: (id) => set({ selectedDatabaseId: id }),
      setSelectedCalendar: (id) => set({ selectedCalendarId: id }),
      setWorkspaceId: (id) => set({ workspaceId: id }),
      setConnectedAt: (connectedAt) => set({ connectedAt }),

      reset: () =>
        set({
          currentStep: 1,
          completedSteps: [],
          notionConnected: false,
          calendarConnected: false,
          selectedDatabaseId: null,
          selectedCalendarId: null,
          workspaceId: null,
          connectedAt: null,
        }),
    }),
    {
      name: 'onboarding-store',
    }
  )
)
