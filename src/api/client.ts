// src/api/client.ts
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'
import { csrfManager } from './csrf'
import { useAuthStore } from '@/stores/authStore'
import { createLogger } from '@/utils/logger'

const log = createLogger('api:client')

const API_URL = ''  // Vite proxy

let requestCounter = 0
const generateRequestId = () => `req-${Date.now()}-${++requestCounter}`

export const apiClient = axios.create({
    baseURL: API_URL,
    timeout: 60000,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
})

const CSRF_PROTECTED_ENDPOINTS = [
    '/auth/signup',
    '/auth/login',
    '/auth/logout',
    '/auth/refresh',
    '/auth/verify',
    '/auth/apple-signin',
    '/auth/reset-password',
    '/auth/reset-password/confirm',
    '/auth/2fa/setup',
    '/auth/2fa/setup/verify',
    '/auth/2fa',
    '/auth/2fa/verify',
    '/auth/2fa/backup-codes',
]

apiClient.interceptors.request.use(
    async (config) => {
        config.withCredentials = true

        const requestId = generateRequestId()
        config.headers['X-Request-ID'] = requestId

        // Method/URL only — never log document.cookie or request bodies here.
        // Bodies frequently contain passwords, tokens, or 2FA codes.
        log.debug('Request', { requestId, method: config.method?.toUpperCase(), url: config.url })

        const url = config.url ?? ''
        const needsCsrf = CSRF_PROTECTED_ENDPOINTS.some(
            (endpoint) => url === endpoint || url.startsWith(`${endpoint}?`)
        )

        if (needsCsrf) {
            try {
                config.headers['X-CSRF-Token'] = await csrfManager.getToken()
                log.debug('CSRF token attached', { requestId, url })
            } catch (error) {
                log.warn('Failed to obtain CSRF token', { requestId, url, error: (error as Error).message })
                throw error
            }
        }

        delete config.headers.Authorization

        return config
    },
    (error) => {
        log.error('Request setup failed', { error: error?.message })
        return Promise.reject(error)
    }
)

apiClient.interceptors.response.use(
    (response) => {
        const requestId = response.config.headers?.['X-Request-ID']
        log.debug('Response', { requestId, status: response.status, url: response.config.url })
        return response
    },
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }
        const requestId = originalRequest?.headers?.['X-Request-ID']
        const status = error.response?.status

        log.warn('Response error', { requestId, status, url: originalRequest?.url })

        if (status === 403) {
            const errorDetail = (error.response?.data as any)?.detail
            const isCsrfError = typeof errorDetail === 'string' && errorDetail.toLowerCase().includes('csrf')

            if (isCsrfError && !originalRequest._retry) {
                originalRequest._retry = true
                log.info('CSRF token rejected, refreshing and retrying', { requestId, url: originalRequest.url })

                csrfManager.clearToken()

                try {
                    const newCsrfToken = await csrfManager.getToken()
                    if (originalRequest.headers) {
                        originalRequest.headers['X-CSRF-Token'] = newCsrfToken
                    }
                    return apiClient(originalRequest)
                } catch (csrfError) {
                    log.error('CSRF retry failed', { requestId, error: (csrfError as Error).message })
                }
            }
        }

        if (status === 401 && !originalRequest._retry) {
            const isAuthEndpoint =
                originalRequest.url?.includes('/auth/refresh') ||
                originalRequest.url?.includes('/auth/2fa/verify') ||
                originalRequest.url?.includes('/auth/login')

            if (isAuthEndpoint) {
                log.info('401 on auth endpoint, not attempting refresh', { requestId, url: originalRequest.url })
                csrfManager.clearToken()

                if (!window.location.pathname.includes('/signin') && !window.location.pathname.includes('/signup')) {
                    window.location.href = '/signin'
                }
                return Promise.reject(error)
            }

            originalRequest._retry = true
            log.info('401 received, attempting cookie-based token refresh', { requestId, url: originalRequest.url })

            try {
                const refreshResponse = await apiClient.post('/auth/refresh', {})
                const user = (refreshResponse.data as any).user

                useAuthStore.getState().setUser(user)
                log.info('Token refresh succeeded, retrying original request', { requestId })

                delete originalRequest.headers.Authorization

                return apiClient(originalRequest)
            } catch (refreshError) {
                log.warn('Token refresh failed, logging out', { requestId, error: (refreshError as Error).message })

                useAuthStore.getState().logout()
                csrfManager.clearToken()

                if (!window.location.pathname.includes('/signin') && !window.location.pathname.includes('/signup')) {
                    window.location.href = '/signin'
                }

                return Promise.reject(refreshError)
            }
        }

        if (status === 429) {
            log.warn('Rate limit exceeded', { requestId, url: originalRequest?.url })
        } else if (status === 500) {
            log.error('Server error', { requestId, url: originalRequest?.url })
        }

        return Promise.reject(error)
    }
)

if (import.meta.env.DEV) {
    (window as any).apiClient = apiClient
    log.debug('window.apiClient exposed for dev inspection')
}