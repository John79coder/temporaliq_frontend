export interface SchedulePreference {
    workingHours: {
        start: string
        end: string
    }
    breakDuration: number
    focusTime: boolean
    weekends: boolean
}

export interface ScheduledTask {
    id: string
    taskId: string
    title: string
    scheduledStart: Date
    scheduledEnd: Date
    calendarId: string
    status: 'pending' | 'scheduled' | 'completed'
}
