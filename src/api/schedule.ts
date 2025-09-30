// src/api/schedule.ts
import { apiClient } from './client'
import { API_ENDPOINTS } from '@/utils/constants'

// Same per-call base override pattern as notion.ts
const API_BASE = (import.meta as any).env?.VITE_API_URL as string | undefined
const withBase = () => (API_BASE ? { baseURL: API_BASE } : {})

// Fallbacks to literal paths if constants aren’t populated
const PREVIEW_EP =
    (API_ENDPOINTS as any)?.SCHEDULING?.PREVIEW ?? '/scheduling/preview'
const CONFIRM_EP =
    (API_ENDPOINTS as any)?.SCHEDULING?.CONFIRM ?? '/scheduling/confirm'

/** Request shape the backend expects for preview. */
export interface SchedulePreviewRequest {
    user_id: number
    notion_db_id: string
    calendar_id: string
    start_date: string // ISO date-time (e.g. "2025-09-25T00:00:00Z")
    end_date: string   // ISO date-time
    earliest_time: string // "HH:MM" (e.g. "09:00")
    latest_time: string   // "17:00"
}

export interface TimeBlock {
    start: string // ISO
    end: string   // ISO
    task_id?: number | null
}

export interface SchedulePreviewResponse {
    time_blocks: TimeBlock[]
}

export interface ScheduleConfirmRequest {
    user_id: number
    calendar_id: string
    time_blocks: Array<{ start: string; end: string; task_id?: number | null }>
}

export interface ScheduleConfirmResponse {
    message: string
}

/** POST /scheduling/preview */
export async function previewSchedule(
    body: SchedulePreviewRequest
): Promise<SchedulePreviewResponse> {
    const { data } = await apiClient.post(PREVIEW_EP, body, withBase())
    return data
}

/** POST /scheduling/confirm */
export async function confirmSchedule(
    body: ScheduleConfirmRequest
): Promise<ScheduleConfirmResponse> {
    const { data } = await apiClient.post(CONFIRM_EP, body, withBase())
    return data
}
