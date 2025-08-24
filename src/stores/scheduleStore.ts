import { create } from 'zustand'

interface ScheduleState {
    tasks: any[]
    isLoading: boolean

    setTasks: (tasks: any[]) => void
    setLoading: (loading: boolean) => void
}

export const useScheduleStore = create<ScheduleState>((set) => ({
    tasks: [],
    isLoading: false,

    setTasks: (tasks) => set({ tasks }),
    setLoading: (isLoading) => set({ isLoading }),
}))
