// src/api/csrf.ts
import axios from 'axios'
import { createLogger, fingerprint } from '@/utils/logger'

const log = createLogger('api:csrf')

const API_URL = ''  // Vite proxy

class CSRFManager {
    private tokenPromise: Promise<string> | null = null
    private tokenFetchCount = 0
    private lastFetchTime: number | null = null
    private lastToken: string | null = null

    async getToken(): Promise<string> {
        if (this.lastToken) {
            return this.lastToken
        }

        if (!this.tokenPromise) {
            this.tokenPromise = this.fetchToken()
        }

        try {
            const token = await this.tokenPromise
            this.lastToken = token
            log.debug('CSRF token retrieved', { token: fingerprint(token) })
            return token
        } catch (error) {
            log.warn('CSRF token retrieval failed', { error: (error as Error).message })
            this.tokenPromise = null
            throw error
        }
    }

    private async fetchToken(): Promise<string> {
        this.tokenFetchCount++
        this.lastFetchTime = Date.now()

        log.debug('Fetching CSRF token', { attempt: this.tokenFetchCount })

        try {
            const response = await axios.get(`${API_URL}/auth/csrf`, {
                withCredentials: true,
                headers: {
                    'X-Request-ID': `csrf-fetch-${Date.now()}`,
                    'Accept': 'application/json',
                },
            })

            const token = response.data.csrf_token
            if (!token) {
                throw new Error('No CSRF token returned from backend')
            }

            log.debug('CSRF token fetched', { token: fingerprint(token) })
            return token
        } catch (error: any) {
            log.warn('CSRF fetch failed', {
                status: error.response?.status,
                message: error.message,
            })
            throw error
        }
    }

    clearToken(): void {
        log.debug('CSRF token cleared')
        this.tokenPromise = null
        this.lastToken = null
    }

    getStats() {
        return {
            fetchCount: this.tokenFetchCount,
            lastFetchTime: this.lastFetchTime ? new Date(this.lastFetchTime).toISOString() : null,
            hasActivePromise: this.tokenPromise !== null,
        }
    }
}

export const csrfManager = new CSRFManager()

if (import.meta.env.DEV) {
    (window as any).csrfManager = csrfManager
    log.debug('window.csrfManager exposed for dev inspection')
}