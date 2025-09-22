// src/api/client.ts
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'
import { getStoredToken, removeStoredToken, setStoredToken, getRefreshToken, setRefreshToken } from '@/utils/storage'
import { csrfManager } from './csrf'
import { cookieAuthManager } from './cookieAuth';

const API_URL = '';  // Use Vite proxy for same-origin requests in dev

// Request ID generator for tracking
let requestCounter = 0
const generateRequestId = () => `req-${Date.now()}-${++requestCounter}`

export const apiClient = axios.create({
    baseURL: API_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // Important for CSRF cookies
})

// === ENHANCED FOR 2FA: Token refresh queue management ===
let isRefreshing = false
let refreshSubscribers: Array<(token: string) => void> = []

const subscribeTokenRefresh = (cb: (token: string) => void) => {
    refreshSubscribers.push(cb)
}

const onTokenRefreshed = (token: string) => {
    refreshSubscribers.forEach((cb) => cb(token))
    refreshSubscribers = []
}
// === END 2FA ENHANCEMENT ===

// Request interceptor for auth token and CSRF
apiClient.interceptors.request.use(
    async (config) => {
        // Always send credentials for cookie support
        config.withCredentials = true;

        // Add request ID
        const requestId = generateRequestId()
        config.headers['X-Request-ID'] = requestId

        console.log(`[API Request ${requestId}] ${config.method?.toUpperCase()} ${config.url}`)
        console.log(`[API Request ${requestId}] Cookies:`, document.cookie)

        // Add JWT token from localStorage only if no cookie auth
        // This maintains backward compatibility while preferring cookies
        if (cookieAuthManager.shouldSendAuthHeader()) {
            const token = getStoredToken()
            if (token && config.headers) {
                config.headers.Authorization = `Bearer ${token}`
                console.log(`[API Request ${requestId}] Added JWT token from localStorage`)
            }
        } else {
            console.log(`[API Request ${requestId}] Using cookie-based auth`)
        }

        // Add CSRF token for state-changing requests
        const method = config.method?.toLowerCase()
        if (method && ['post', 'put', 'patch', 'delete'].includes(method)) {
            console.log(`[API Request ${requestId}] State-changing request, fetching CSRF token`)

            try {
                const csrfToken = await csrfManager.getToken()
                config.headers['X-CSRF-Token'] = csrfToken
                console.log(`[API Request ${requestId}] Added CSRF token:`, csrfToken.substring(0, 10) + '...')
            } catch (error) {
                console.error(`[API Request ${requestId}] Failed to get CSRF token:`, error)
                // Let request proceed - server will reject if CSRF required
            }
        }

        console.log(`[API Request ${requestId}] Final headers:`, {
            ...config.headers,
            'X-CSRF-Token': config.headers['X-CSRF-Token'] ?
                (config.headers['X-CSRF-Token'] as string).substring(0, 10) + '...' :
                undefined,
            'Authorization': config.headers.Authorization ? 'Bearer ...' : undefined
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

// Response interceptor for error handling
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

        // Handle CSRF token errors (403 with CSRF message)
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

        // === ENHANCED 401 HANDLING FOR 2FA ===
        if (error.response?.status === 401 && !originalRequest._retry) {
            // Don't refresh for certain endpoints
            if (originalRequest.url?.includes('/auth/refresh') ||
                originalRequest.url?.includes('/auth/2fa/verify') ||
                originalRequest.url?.includes('/auth/login')) {
                console.log(`[API Response ${requestId}] Skipping refresh for auth endpoint`)
                removeStoredToken()
                csrfManager.clearToken()

                // Only redirect if not on auth pages already
                if (!window.location.pathname.includes('/signin') &&
                    !window.location.pathname.includes('/signup')) {
                    window.location.href = '/signin'
                }
                return Promise.reject(error)
            }

            originalRequest._retry = true
            console.log(`[API Response ${requestId}] 401 Unauthorized, attempting token refresh`)

            // Handle concurrent refresh requests
            if (!isRefreshing) {
                isRefreshing = true

                try {
                    const refreshToken = getRefreshToken() || localStorage.getItem('refresh_token')
                    if (refreshToken) {
                        console.log(`[API Response ${requestId}] Found refresh token, attempting refresh`)

                        const response = await axios.post(`${API_URL}/auth/refresh`, {
                            refresh_token: refreshToken,
                        }, {
                            withCredentials: true,
                        })

                        const { access_token, refresh_token: new_refresh_token } = response.data
                        setStoredToken(access_token)

                        if (new_refresh_token) {
                            setRefreshToken(new_refresh_token)
                        }

                        console.log(`[API Response ${requestId}] Token refreshed successfully`)

                        // Notify all waiting requests
                        onTokenRefreshed(access_token)
                        isRefreshing = false

                        if (originalRequest.headers) {
                            originalRequest.headers.Authorization = `Bearer ${access_token}`
                        }

                        return apiClient(originalRequest)
                    } else {
                        console.log(`[API Response ${requestId}] No refresh token available`)
                        isRefreshing = false
                    }
                } catch (refreshError) {
                    console.error(`[API Response ${requestId}] Token refresh failed:`, refreshError)
                    isRefreshing = false
                    refreshSubscribers = []
                    removeStoredToken()
                    csrfManager.clearToken()

                    // Only redirect if not on auth pages
                    if (!window.location.pathname.includes('/signin') &&
                        !window.location.pathname.includes('/signup')) {
                        window.location.href = '/signin'
                    }
                    return Promise.reject(refreshError)
                }
            } else {
                // Wait for token refresh to complete
                console.log(`[API Response ${requestId}] Waiting for ongoing token refresh`)

                return new Promise((resolve) => {
                    subscribeTokenRefresh((token: string) => {
                        console.log(`[API Response ${requestId}] Got refreshed token, retrying request`)
                        if (originalRequest.headers) {
                            originalRequest.headers.Authorization = `Bearer ${token}`
                        }
                        resolve(apiClient(originalRequest))
                    })
                })
            }
        }
        // === END 2FA ENHANCEMENT ===

        // Handle other error statuses
        if (error.response?.status === 429) {
            console.error(`[API Response ${requestId}] Rate limit exceeded`)
        } else if (error.response?.status === 500) {
            console.error(`[API Response ${requestId}] Server error`)
        }

        return Promise.reject(error)
    }
)

// Debug helpers
if (import.meta.env.DEV) {
    (window as any).apiClient = apiClient
    console.log('[API Client] Debug: window.apiClient available for inspection')
}

export default apiClient