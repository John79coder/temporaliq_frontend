// src/utils/authDebug.ts
// Debug helper to check auth storage state — dev-only diagnostic tool.

import { createLogger, redact } from './logger'

const log = createLogger('utils:authDebug')
const isDev = Boolean(import.meta.env?.DEV)

export const debugAuthStorage = async () => {
    if (!isDev) return

    console.group('🔐 Auth Storage Debug')

    console.log('Direct user_data (redacted):', redact(safeParse(localStorage.getItem('user_data'))))

    const authStore = localStorage.getItem('auth')
    if (authStore) {
        try {
            const parsed = JSON.parse(authStore)
            // Note: authStore's persist() only ever writes { user }, via its
            // partialize config — there is no token field in this store.
            console.log('Zustand auth store user (redacted):', redact(parsed?.state?.user || parsed?.user))
        } catch (e) {
            log.warn('Failed to parse auth store', { error: (e as Error).message })
        }
    } else {
        console.log('No Zustand auth store found')
    }

    console.log('Session user_data (redacted):', redact(safeParse(sessionStorage.getItem('user_data'))))

    const { getStoredUser } = await import('./storage')
    console.log('getStoredUser() returns (redacted):', redact(getStoredUser()))

    console.groupEnd()
}

function safeParse(raw: string | null): unknown {
    if (!raw) return null
    try {
        return JSON.parse(raw)
    } catch {
        return raw
    }
}

// Only ever attached in dev builds.
if (isDev && typeof window !== 'undefined') {
    (window as any).debugAuthStorage = debugAuthStorage
}