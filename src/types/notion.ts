export interface NotionDatabase {
    id: string
    title: string
    icon?: string
    properties: Record<string, any>
}

export interface NotionTask {
    id: string
    title: string
    status?: string
    priority?: string
    dueDate?: string
    duration?: number
    properties: Record<string, any>
}
