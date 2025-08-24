import { apiClient } from './client'
import type { Calendar, CalendarEvent } from '@/types/calendar'

export const connectCalendar = async (provider: 'icloud' | 'google'): Promise<void> => {
    // Mock for now
    return Promise.resolve()
}

export const getCalendars = async (): Promise<Calendar[]> => {
    // Mock for now
    return []
}

export const getCalendarEvents = async (calendarId: string): Promise<CalendarEvent[]> => {
    // Mock for now
    return []
}
