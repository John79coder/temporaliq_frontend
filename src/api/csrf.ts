// src/api/csrf.ts
import axios from 'axios';
import { debugLogger } from './debugHelpers';

const API_URL = '';  // Vite proxy

class CSRFManager {
    private tokenPromise: Promise<string> | null = null;
    private tokenFetchCount = 0;
    private lastFetchTime: number | null = null;
    private lastToken: string | null = null;

    getTokenFromCookie(): string | null {
        const match = document.cookie.match(/(?:^|;\s*)csrf_token=([^;]+)/);
        if (!match) return null;
        try {
            return decodeURIComponent(match[1]);
        } catch {
            return match[1];
        }
    }

    async getToken(): Promise<string> {
        debugLogger.logCookieState('CSRF getToken called');
        console.log('[CSRFManager] getToken called');

        if (this.lastToken) {
            return this.lastToken;
        }

        if (!this.tokenPromise) {
            console.log('[CSRFManager] Creating new token promise');
            this.tokenPromise = this.fetchToken();
        }

        try {
            const token = await this.tokenPromise;
            this.lastToken = token;
            console.log('[CSRFManager] Token retrieved:', token.substring(0, 20) + '...');
            debugLogger.logCookieState('CSRF token retrieved');
            return token;
        } catch (error) {
            console.error('[CSRFManager] Token retrieval failed:', error);
            this.tokenPromise = null;
            throw error;
        }
    }

    private async fetchToken(): Promise<string> {
        this.tokenFetchCount++;
        this.lastFetchTime = Date.now();

        console.group(`[CSRFManager] Fetch attempt #${this.tokenFetchCount}`);
        debugLogger.logCookieState('Before CSRF fetch');

        try {
            const config = {
                withCredentials: true,
                headers: {
                    'X-Request-ID': `csrf-fetch-${Date.now()}`,
                    'Accept': 'application/json',
                }
            };

            debugLogger.logNetworkRequest({ ...config, url: `${API_URL}/auth/csrf`, method: 'GET' }, 'CSRF Fetch');
            const response = await axios.get(`${API_URL}/auth/csrf`, config);
            debugLogger.logNetworkResponse(response, 'CSRF Fetch');
            debugLogger.logCookieState('After CSRF fetch');

            const token = response.data.csrf_token;
            if (!token) {
                throw new Error('No CSRF token returned from backend');
            }

            console.log('✅ CSRF token fetched successfully');
            console.log('Debug info from server:', response.data.debug);
            console.groupEnd();
            return token;
        } catch (error: any) {
            console.error('❌ CSRF fetch failed:', error);
            console.log('Error response:', error.response?.data);
            console.groupEnd();
            throw error;
        }
    }

    clearToken(): void {
        console.log('[CSRFManager] Clearing token');
        this.tokenPromise = null;
        this.lastToken = null;
    }

    getDebugInfo() {
        return {
            fetchCount: this.tokenFetchCount,
            lastFetchTime: this.lastFetchTime ? new Date(this.lastFetchTime).toISOString() : null,
            hasActivePromise: this.tokenPromise !== null,
            lastToken: this.lastToken ? this.lastToken.substring(0, 20) + '...' : null,
            currentCookies: document.cookie,
        };
    }

    getStats() {
        return {
            fetchCount: this.tokenFetchCount,
            lastFetchTime: this.lastFetchTime ? new Date(this.lastFetchTime).toISOString() : null,
            hasActivePromise: this.tokenPromise !== null,
        }
    }
}

export const csrfManager = new CSRFManager();

if (typeof window !== 'undefined') {
    (window as any).csrfManager = csrfManager;
}
