// src/api/client.ts
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'
import { csrfManager } from './csrf'
import { useAuthStore } from '@/stores/authStore'

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

apiClient.interceptors.request.use(
    async (config) => {
        config.withCredentials = true

        const requestId = generateRequestId()
        config.headers['X-Request-ID'] = requestId

        console.log(`[API Request ${requestId}] ${config.method?.toUpperCase()} ${config.url}`)
        console.log(`[API Request ${requestId}] Cookies:`, document.cookie)

        const csrfProtectedEndpoints = [
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

        const url = config.url ?? ''

        const needsCsrf = csrfProtectedEndpoints.some(
            endpoint => url === endpoint || url.startsWith(`${endpoint}?`)
        )

        if (needsCsrf) {
            console.log(`[API Request ${requestId}] CSRF-protected endpoint, fetching CSRF token`)

            try {
                const csrfToken = await csrfManager.getToken()
                config.headers['X-CSRF-Token'] = csrfToken
                console.log(`[API Request ${requestId}] Added CSRF token:`, csrfToken.substring(0, 10) + '...')
            } catch (error) {
                console.error(`[API Request ${requestId}] Failed to get CSRF token:`, error)
                throw error
            }
        }

        delete config.headers.Authorization

        console.log(`[API Request ${requestId}] Final headers:`, {
            ...config.headers,
            'X-CSRF-Token': config.headers['X-CSRF-Token']
                ? (config.headers['X-CSRF-Token'] as string).substring(0, 10) + '...'
                : undefined,
        })

        if (config.data) {
            console.log(`[API Request ${requestId}] Body:`, config.data)
        }

        return config
    },
    (error) => {
        console.error('[API Request Error]:', error)
        return Promise.reject(error)
    }
)

apiClient.interceptors.response.use(
    (response) => {
        const requestId = response.config.headers?.['X-Request-ID']
        console.log(`[API Response ${requestId}] Success:`, {
            status: response.status,
            url: response.config.url,
            data: response.data,
        })
        console.log(`[API Response ${requestId}] Response headers:`, response.headers)
        return response
    },
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }
        const requestId = originalRequest?.headers?.['X-Request-ID']

        console.error(`[API Response ${requestId}] Error:`, {
            status: error.response?.status,
            data: error.response?.data,
            headers: error.response?.headers,
        })

        if (error.response?.status === 403 && error.response?.data) {
            const errorDetail = (error.response.data as any).detail
            if (errorDetail && typeof errorDetail === 'string' && errorDetail.toLowerCase().includes('csrf')) {
                console.log(`[API Response ${requestId}] CSRF error detected`)

                if (!originalRequest._retry) {
                    originalRequest._retry = true
                    console.log(`[API Response ${requestId}] Clearing CSRF and retrying`)

                    csrfManager.clearToken()

                    try {
                        const newCsrfToken = await csrfManager.getToken()
                        if (originalRequest.headers) {
                            originalRequest.headers['X-CSRF-Token'] = newCsrfToken
                            console.log(`[API Response ${requestId}] Retrying with new CSRF token`)
                        }
                        return apiClient(originalRequest)
                    } catch (csrfError) {
                        console.error(`[API Response ${requestId}] CSRF retry failed:`, csrfError)
                    }
                }
            }
        }

        if (error.response?.status === 401 && !originalRequest._retry) {
            if (originalRequest.url?.includes('/auth/refresh') ||
                originalRequest.url?.includes('/auth/2fa/verify') ||
                originalRequest.url?.includes('/auth/login')) {
                console.log(`[API Response ${requestId}] Skipping refresh for auth endpoint`)
                csrfManager.clearToken()

                if (!window.location.pathname.includes('/signin') &&
                    !window.location.pathname.includes('/signup')) {
                    window.location.href = '/signin'
                }
                return Promise.reject(error)
            }

            originalRequest._retry = true
            console.log(`[API Response ${requestId}] 401 Unauthorized, attempting cookie-based token refresh`)

            try {
                const refreshResponse = await apiClient.post('/auth/refresh', {})
                const user = (refreshResponse.data as any).user

                useAuthStore.getState().setUser(user)

                console.log(`[API Response ${requestId}] Token refreshed via cookies, retrying original request`)

                delete originalRequest.headers.Authorization

                return apiClient(originalRequest)
            } catch (refreshError) {
                console.error(`[API Response ${requestId}] Cookie-based refresh failed:`, refreshError)

                useAuthStore.getState().logout()
                csrfManager.clearToken()

                if (!window.location.pathname.includes('/signin') &&
                    !window.location.pathname.includes('/signup')) {
                    window.location.href = '/signin'
                }

                return Promise.reject(refreshError)
            }
        }

        if (error.response?.status === 429) {
            console.error(`[API Response ${requestId}] Rate limit exceeded`)
        } else if (error.response?.status === 500) {
            console.error(`[API Response ${requestId}] Server error`)
        }

        return Promise.reject(error)
    }
)

if (import.meta.env.DEV) {
    (window as any).apiClient = apiClient
    console.log('[API Client] Debug: window.apiClient available for inspection')
}

export default apiClient
