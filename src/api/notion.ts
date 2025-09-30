/**
 * src/api/notion.ts
 * Minimal change: ensure all Notion requests hit the backend origin
 * by passing a per-call baseURL derived from VITE_API_URL.
 */
import { apiClient } from './client'
import { API_ENDPOINTS } from '@/utils/constants'

// Use an absolute backend URL like "http://localhost:8000"
const API_BASE = (import.meta as any).env?.VITE_API_URL as string | undefined
const withBase = () => (API_BASE ? { baseURL: API_BASE } : {})

// ----- Types that mirror backend contracts (kept minimal to avoid over-assuming) -----

export type NotionConnectPayload = {
    user_id: number
    code: string
    /** exact backend type is HttpUrl; send as string */
    redirect_uri: string
}

export type NotionConnectResponse = {
    // Backend returns NotionTokenOut from stored connection. We don't rely on fields here.
    // Accept unknown shape and let UI react to 200 vs error.
    [k: string]: unknown
}

export type NotionDatabase = {
    // Backend DatabaseOut shape isn’t fully specified in the docs we have.
    // We only rely on id and name if present, but keep the rest open.
    id?: string
    name?: string
    [k: string]: unknown
}

export type FieldMappingIn = {
    user_id: number
    notion_db_id: string
    title_field: string
    due_date_field: string
    duration_field: string
}

export type FieldMappingOut = {
    // Keep flexible; UI only needs acks and ids
    notion_db_id: string
    [k: string]: unknown
}

export type TaskCandidate = {
    // Avoid assumptions, only surface what lists can display safely
    title?: string
    id?: string
    [k: string]: unknown
}

// ----- API functions -----

export async function connectNotion(payload: NotionConnectPayload): Promise<NotionConnectResponse> {
    const { data } = await apiClient.post(API_ENDPOINTS.NOTION.CONNECT, payload, withBase())
    return data
}

export async function listNotionDatabases(): Promise<NotionDatabase[]> {
    const { data } = await apiClient.get(API_ENDPOINTS.NOTION.DATABASES, withBase())
    return Array.isArray(data) ? data : []
}

export async function previewMapping(database_id: string): Promise<unknown> {
    const { data } = await apiClient.post(
        API_ENDPOINTS.NOTION.PREVIEW_MAPPING,
        { database_id },
        withBase()
    )
    return data
}

export async function mapSchema(body: FieldMappingIn): Promise<FieldMappingOut> {
    const { data } = await apiClient.post(API_ENDPOINTS.NOTION.MAP_SCHEMA, body, withBase())
    return data
}

export async function generateCandidates(database_id: string): Promise<TaskCandidate[]> {
    const { data } = await apiClient.post(
        API_ENDPOINTS.NOTION.GENERATE_CANDIDATES,
        { database_id },
        withBase()
    )
    return Array.isArray(data) ? data : []
}

export async function generateCandidatesFromPage(
    page_id: string,
    force_single_task?: boolean
): Promise<TaskCandidate[]> {
    const { data } = await apiClient.post(
        API_ENDPOINTS.NOTION.PAGES_GENERATE_CANDIDATES,
        { page_id, ...(force_single_task !== undefined ? { force_single_task } : {}) },
        withBase()
    )
    return Array.isArray(data) ? data : []
}

export async function refreshNotionToken(): Promise<unknown> {
    const { data } = await apiClient.post(API_ENDPOINTS.NOTION.REFRESH_TOKEN, {}, withBase())
    return data
}
