import { apiClient } from './client'
import type { ScheduledTask } from '@/types/schedule'

export const generateSchedule = async (taskIds: string[]): Promise<ScheduledTask[]> => {
    // Mock for now
    return []
}

export const saveSchedule = async (tasks: ScheduledTask[]): Promise<void> => {
    // Mock for now
    return Promise.resolve()
}
