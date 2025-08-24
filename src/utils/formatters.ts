import { format, formatDistanceToNow, isValid } from 'date-fns'

export const formatDate = (date: string | Date): string => {
    const d = typeof date === 'string' ? new Date(date) : date
    if (!isValid(d)) return 'Invalid date'
    return format(d, 'MMM d, yyyy')
}

export const formatDateTime = (date: string | Date): string => {
    const d = typeof date === 'string' ? new Date(date) : date
    if (!isValid(d)) return 'Invalid date'
    return format(d, 'MMM d, yyyy h:mm a')
}

export const formatRelativeTime = (date: string | Date): string => {
    const d = typeof date === 'string' ? new Date(date) : date
    if (!isValid(d)) return 'Invalid date'
    return formatDistanceToNow(d, { addSuffix: true })
}
