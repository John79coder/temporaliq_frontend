export interface Calendar {
    id: string
    name: string
    color?: string
    isDefault?: boolean
}

export interface CalendarEvent {
    id: string
    title: string
    start: Date
    end: Date
    calendarId: string
    isAllDay?: boolean
}
