import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

interface OnboardingState {
    currentStep: number
    completedSteps: number[]
    notionConnected: boolean
    calendarConnected: boolean
    selectedDatabaseId: string | null
    selectedCalendarId: string | null

    // Actions
    setCurrentStep: (step: number) => void
    completeStep: (step: number) => void
    setNotionConnected: (connected: boolean) => void
    setCalendarConnected: (connected: boolean) => void
    setSelectedDatabase: (id: string | null) => void
    setSelectedCalendar: (id: string | null) => void
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

            setCurrentStep: (step) => set({ currentStep: step }),

            completeStep: (step) =>
                set((state) => ({
                    completedSteps: [...new Set([...state.completedSteps, step])],
                })),

            setNotionConnected: (connected) => set({ notionConnected: connected }),
            setCalendarConnected: (connected) => set({ calendarConnected: connected }),
            setSelectedDatabase: (id) => set({ selectedDatabaseId: id }),
            setSelectedCalendar: (id) => set({ selectedCalendarId: id }),

            reset: () =>
                set({
                    currentStep: 1,
                    completedSteps: [],
                    notionConnected: false,
                    calendarConnected: false,
                    selectedDatabaseId: null,
                    selectedCalendarId: null,
                }),
        }),
        {
            name: 'onboarding-store',
        }
    )
)
