// src/api/cookieAuth.ts
/**
 * Cookie-based authentication support
 * This module provides utilities for transitioning to cookie-based auth
 * while maintaining backward compatibility with localStorage tokens.
 *
 * NOTE: hasCookieAuth() reads document.cookie for 'auth_token'. If the
 * backend sets auth_token as HttpOnly (recommended for an auth cookie),
 * this will never see it, and shouldSendAuthHeader() will always return
 * true. Confirm the cookie's HttpOnly flag before relying on this check —
 * see conversation notes.
 */

import { createLogger } from '@/utils/logger'

const log = createLogger('api:cookieAuth')

export class CookieAuthManager {
    private static instance: CookieAuthManager

    static getInstance(): CookieAuthManager {
        if (!CookieAuthManager.instance) {
            CookieAuthManager.instance = new CookieAuthManager()
        }
        return CookieAuthManager.instance
    }

    /**
     * Check if cookie-based auth is available.
     * The backend sets an 'auth_token' cookie on successful login.
     */
    hasCookieAuth(): boolean {
        const present = document.cookie.split(';').some((cookie) => cookie.trim().startsWith('auth_token='))
        log.debug('Cookie auth check', { present })
        return present
    }

    /**
     * Clear auth cookie by setting it to expire.
     * This is handled by the backend on logout, but we can also clear client-side
     * (only effective if the cookie is not HttpOnly).
     */
    clearAuthCookie(): void {
        document.cookie = 'auth_token=; Max-Age=0; path=/; SameSite=Lax'
        log.debug('Cleared auth_token cookie client-side')
    }

    /**
     * Determine if we should send an Authorization header.
     * Returns false if cookie auth is available (more secure).
     */
    shouldSendAuthHeader(): boolean {
        const useHeader = !this.hasCookieAuth()
        log.debug('Auth header decision', { useHeader })
        return useHeader
    }
}

export const cookieAuthManager = CookieAuthManager.getInstance()