// src/api/icloud.ts
import { apiClient } from './client'
import { API_ENDPOINTS } from '@/utils/constants'

// Use the same per-call base override pattern as notion.ts
const API_BASE = (import.meta as any).env?.VITE_API_URL as string | undefined
const withBase = () => (API_BASE ? { baseURL: API_BASE } : {})

// Fallback to literal path if constants don’t define it
const CALENDARS_EP =
    (API_ENDPOINTS as any)?.ICLOUD?.CALENDARS ?? '/icloud/calendars'

export type ICloudCalendar = {
    id: string
    title?: string
    [k: string]: unknown
}

/** GET /icloud/calendars */
export async function listCalendars(): Promise<ICloudCalendar[]> {
    const { data } = await apiClient.get(CALENDARS_EP, withBase())
    return Array.isArray(data) ? data : []
}
