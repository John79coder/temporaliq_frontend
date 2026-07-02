// src/utils/logger.ts
//
// Structured, leveled, redaction-by-default logger for the frontend.
//
// Design goals:
//  - No secrets in logs, ever, even by accident. Redaction is applied
//    automatically based on key name, not opt-in per call site.
//  - Verbose (debug) logs only ship in dev builds by default.
//  - Every entry is structured (scope, level, message, context, timestamp)
//    so it's easy to filter in devtools and easy to swap the sink later
//    (e.g. forward `warn`/`error` to Sentry/LogRocket) without touching
//    call sites.

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

const LEVEL_WEIGHT: Record<LogLevel, number> = {
    debug: 10,
    info: 20,
    warn: 30,
    error: 40,
}

const isDev = Boolean(import.meta.env?.DEV)

// Allow override via .env (VITE_LOG_LEVEL=debug|info|warn|error) without a rebuild flag flip.
const configuredLevel = (import.meta.env?.VITE_LOG_LEVEL as LogLevel | undefined)
const defaultLevel: LogLevel = isDev ? 'debug' : 'warn'
const threshold = LEVEL_WEIGHT[configuredLevel as LogLevel] ?? LEVEL_WEIGHT[defaultLevel]

// Key names (case-insensitive) that are always redacted wherever they appear
// in a logged object, no matter how deeply nested.
const SENSITIVE_KEYS = new Set([
    'password',
    'newpassword',
    'new_password',
    'token',
    'csrf_token',
    'csrf-token',
    'x-csrf-token',
    'authorization',
    'cookie',
    'set-cookie',
    'refresh_token',
    'access_token',
    'id_token',
    'authorization_code',
    'code', // 2FA / OAuth codes
    'backup_codes',
    'manual_entry_key',
    'qr_code',
])

const MAX_REDACT_DEPTH = 5

export function redact(value: unknown, depth = 0): unknown {
    if (value == null) return value
    if (depth > MAX_REDACT_DEPTH) return '[Truncated]'

    if (Array.isArray(value)) {
        return value.map((item) => redact(item, depth + 1))
    }

    if (typeof value === 'object') {
        const out: Record<string, unknown> = {}
        for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
            out[key] = SENSITIVE_KEYS.has(key.toLowerCase())
                ? '[REDACTED]'
                : redact(val, depth + 1)
        }
        return out
    }

    return value
}

/**
 * Reveal just enough of a secret to confirm identity in a debug trace
 * (e.g. "confirming the retried request picked up a new CSRF token")
 * without exposing the value itself. Debug-level only by convention.
 */
export function fingerprint(secret: string | null | undefined, visibleChars = 6): string {
    if (!secret) return '(none)'
    if (secret.length <= visibleChars) return '***'
    return `${secret.slice(0, visibleChars)}…(${secret.length} chars)`
}

interface LogEntry {
    timestamp: string
    level: LogLevel
    scope: string
    message: string
    context?: unknown
}

function shouldLog(level: LogLevel): boolean {
    return LEVEL_WEIGHT[level] >= threshold
}

function emit(scope: string, level: LogLevel, message: string, context?: unknown): void {
    if (!shouldLog(level)) return

    const entry: LogEntry = {
        timestamp: new Date().toISOString(),
        level,
        scope,
        message,
        ...(context !== undefined ? { context: redact(context) } : {}),
    }

    const consoleMethod = level === 'debug' ? 'log' : level
    // eslint-disable-next-line no-console
    console[consoleMethod](`[${scope}] ${message}`, entry.context ?? '')

    // Hook point: forward warn/error to a remote sink (Sentry, LogRocket, etc.)
    // once one is wired up. Intentionally left as a no-op for now so this
    // stays a pure logging utility with no external dependency.
}

export interface Logger {
    debug: (message: string, context?: unknown) => void
    info: (message: string, context?: unknown) => void
    warn: (message: string, context?: unknown) => void
    error: (message: string, context?: unknown) => void
}

export function createLogger(scope: string): Logger {
    return {
        debug: (message, context) => emit(scope, 'debug', message, context),
        info: (message, context) => emit(scope, 'info', message, context),
        warn: (message, context) => emit(scope, 'warn', message, context),
        error: (message, context) => emit(scope, 'error', message, context),
    }
}