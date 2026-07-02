// src/api/debugHelpers.ts
//
// Interactive diagnostic tool for auth/cookie/session issues, used from
// devtools during local debugging (window.debugLogger.logCookieState(...)).
//
// This intentionally does NOT hook into the normal request/response
// interceptor chain (see api/client.ts, api/csrf.ts) — that path uses
// utils/logger.ts and stays lean. This module is the "break glass" tool
// you reach for interactively when something's wrong with cookies/session,
// and it is dev-only: every method below is a no-op in production builds,
// and nothing is attached to `window` outside of DEV.

import { fingerprint, redact } from '@/utils/logger'

const isDev = Boolean(import.meta.env?.DEV)

// Cookie names that should never have their raw value printed, even in dev.
const SENSITIVE_COOKIE_NAMES = new Set(['auth_token', 'session', 'csrf_token'])

interface LogRecord {
    type: 'cookies' | 'request' | 'response' | 'storage'
    timestamp: string
    [key: string]: unknown
}

class DebugLogger {
    private static instance: DebugLogger
    private logs: LogRecord[] = []

    static getInstance(): DebugLogger {
        if (!DebugLogger.instance) {
            DebugLogger.instance = new DebugLogger()
        }
        return DebugLogger.instance
    }

    private parseCookies(): Record<string, string> {
        const cookies: Record<string, string> = {}
        document.cookie.split(';').forEach((cookie) => {
            const [name, value] = cookie.trim().split('=')
            if (name) cookies[name] = value || ''
        })
        return cookies
    }

    /** Cookie names present and, for sensitive ones, a fingerprint rather than the raw value. */
    private safeCookieSummary(): Record<string, string> {
        const parsed = this.parseCookies()
        const summary: Record<string, string> = {}
        for (const [name, value] of Object.entries(parsed)) {
            summary[name] = SENSITIVE_COOKIE_NAMES.has(name) ? fingerprint(value) : value
        }
        return summary
    }

    logCookieState(context: string) {
        if (!isDev) return null

        const cookieInfo = {
            timestamp: new Date().toISOString(),
            context,
            cookieNamesPresent: Object.keys(this.parseCookies()),
            cookies: this.safeCookieSummary(),
            cookieEnabled: navigator.cookieEnabled,
        }

        console.group(`🍪 [COOKIES] ${context}`)
        console.log('Cookies (sensitive values fingerprinted):', cookieInfo.cookies)
        console.log('Cookies enabled:', cookieInfo.cookieEnabled)
        console.groupEnd()

        this.logs.push({ type: 'cookies', ...cookieInfo })
        return cookieInfo
    }

    logNetworkRequest(config: any, requestType: string) {
        if (!isDev) return null

        const requestInfo = {
            timestamp: new Date().toISOString(),
            label: requestType,
            url: config.url,
            method: config.method,
            withCredentials: config.withCredentials,
            cookiePresent: this.parseCookies(),
        }

        console.group(`📡 [NETWORK REQUEST] ${requestType}`)
        console.log('URL:', requestInfo.url)
        console.log('Method:', requestInfo.method)
        console.log('WithCredentials:', requestInfo.withCredentials)
        console.log('Cookie names present:', Object.keys(requestInfo.cookiePresent))
        console.groupEnd()

        this.logs.push({ type: 'request', ...requestInfo })
        return requestInfo
    }

    logNetworkResponse(response: any, requestType: string) {
        if (!isDev) return null

        const responseInfo = {
            timestamp: new Date().toISOString(),
            label: requestType,
            status: response.status,
            // Shape only — never the values. A response body containing a
            // user object or 2FA payload should not be printed wholesale.
            dataKeys: response.data && typeof response.data === 'object' ? Object.keys(response.data) : typeof response.data,
            cookieNamesAfter: Object.keys(this.parseCookies()),
        }

        console.group(`📥 [NETWORK RESPONSE] ${requestType}`)
        console.log('Status:', responseInfo.status)
        console.log('Response shape (keys only):', responseInfo.dataKeys)
        console.log('Cookie names after response:', responseInfo.cookieNamesAfter)
        console.groupEnd()

        this.logs.push({ type: 'response', ...responseInfo })
        return responseInfo
    }

    /** Reports which keys exist in storage and their redacted shape — never raw values. */
    logSessionStorage(context: string) {
        if (!isDev) return null

        const redactedLocal = redact(safeParseAll(localStorage))
        const redactedSession = redact(safeParseAll(sessionStorage))

        const storageInfo = {
            timestamp: new Date().toISOString(),
            context,
            localStorageKeys: Object.keys(localStorage),
            sessionStorageKeys: Object.keys(sessionStorage),
            localStorage: redactedLocal,
            sessionStorage: redactedSession,
        }

        console.group(`💾 [STORAGE] ${context}`)
        console.log('LocalStorage (redacted):', storageInfo.localStorage)
        console.log('SessionStorage (redacted):', storageInfo.sessionStorage)
        console.groupEnd()

        this.logs.push({ type: 'storage', ...storageInfo })
        return storageInfo
    }

    async testCookiePersistence() {
        if (!isDev) return

        console.group('🧪 [COOKIE PERSISTENCE TEST]')
        document.cookie = 'test_cookie=test_value; path=/'
        const afterSet = document.cookie.includes('test_cookie')
        console.log('Test cookie set and readable:', afterSet)

        try {
            const response = await fetch('/auth/debug-cookies', {
                method: 'GET',
                credentials: 'include',
                headers: { Accept: 'application/json' },
            })

            if (!response.ok) {
                console.warn('Debug endpoint not available (expected in staging/prod backends):', response.status)
                console.groupEnd()
                return
            }

            const data = await response.json()
            console.log('Debug endpoint reachable, response shape:', redact(data))
        } catch (error) {
            console.error('Debug endpoint failed:', (error as Error).message)
        }
        console.groupEnd()
    }

    exportLogs() {
        return {
            timestamp: new Date().toISOString(),
            logs: this.logs,
            summary: {
                totalRequests: this.logs.filter((l) => l.type === 'request').length,
                totalResponses: this.logs.filter((l) => l.type === 'response').length,
                cookieStates: this.logs.filter((l) => l.type === 'cookies').length,
            },
        }
    }

    clearLogs() {
        this.logs = []
        if (isDev) console.log('🗑️ Debug logs cleared')
    }
}

function safeParseAll(store: Storage): Record<string, unknown> {
    const out: Record<string, unknown> = {}
    for (let i = 0; i < store.length; i++) {
        const key = store.key(i)
        if (!key) continue
        const raw = store.getItem(key)
        try {
            out[key] = raw ? JSON.parse(raw) : raw
        } catch {
            out[key] = raw
        }
    }
    return out
}

export const debugLogger = DebugLogger.getInstance()

// Only ever attached in dev builds — this was previously unconditional,
// which meant a full cookie/header/storage dumping tool was reachable
// from the console in production.
if (isDev && typeof window !== 'undefined') {
    (window as any).debugLogger = debugLogger
    console.log('📝 Debug logger available (dev only): window.debugLogger')
}