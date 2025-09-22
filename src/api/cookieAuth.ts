// src/api/cookieAuth.ts
/**
 * Cookie-based authentication support
 * This module provides utilities for transitioning to cookie-based auth
 * while maintaining backward compatibility with localStorage tokens
 */

export class CookieAuthManager {
    private static instance: CookieAuthManager;

    static getInstance(): CookieAuthManager {
        if (!CookieAuthManager.instance) {
            CookieAuthManager.instance = new CookieAuthManager();
        }
        return CookieAuthManager.instance;
    }

    /**
     * Check if cookie-based auth is available
     * The backend sets 'auth_token' cookie on successful login
     */
    hasCookieAuth(): boolean {
        // Check if auth_token cookie exists
        return document.cookie.split(';').some(cookie =>
            cookie.trim().startsWith('auth_token=')
        );
    }

    /**
     * Clear auth cookie by setting it to expire
     * This is handled by the backend on logout, but we can also clear client-side
     */
    clearAuthCookie(): void {
        // Set cookie with past expiry date to clear it
        document.cookie = 'auth_token=; Max-Age=0; path=/; SameSite=Lax';
    }

    /**
     * Determine if we should send Authorization header
     * Returns false if cookie auth is available (more secure)
     */
    shouldSendAuthHeader(): boolean {
        // Only send header if no cookie auth available
        return !this.hasCookieAuth();
    }
}

export const cookieAuthManager = CookieAuthManager.getInstance();