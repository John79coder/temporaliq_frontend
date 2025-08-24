import { apiClient } from './client'
import type { NotionDatabase, NotionTask } from '@/types/notion'

export const connectNotion = async (): Promise<{ authUrl: string }> => {
    // Mock for now
    return {
        authUrl: 'https://api.notion.com/v1/oauth/authorize?client_id=xxx'
    }
}

export const getNotionDatabases = async (): Promise<NotionDatabase[]> => {
    // Mock for now
    return []
}

export const getNotionTasks = async (databaseId: string): Promise<NotionTask[]> => {
    // Mock for now
    return []
}
