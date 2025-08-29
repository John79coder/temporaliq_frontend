// src/api/client.ts
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'
import { getStoredToken, removeStoredToken, setStoredToken } from '@/utils/storage'
import { csrfManager } from './csrf'

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

// Request interceptor for auth token and CSRF
apiClient.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
        const requestId = generateRequestId()
        config.headers['X-Request-ID'] = requestId

        console.log(`[API Request ${requestId}] ${config.method?.toUpperCase()} ${config.url}`)
        console.log(`[API Request ${requestId}] Cookies:`, document.cookie)

        // Add JWT token if available
        const token = getStoredToken()
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`
            console.log(`[API Request ${requestId}] Added JWT token`)
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
                undefined
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

        // Handle 401 Unauthorized
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true
            console.log(`[API Response ${requestId}] 401 Unauthorized, attempting token refresh`)

            try {
                const refreshToken = localStorage.getItem('refresh_token')
                if (refreshToken) {
                    console.log(`[API Response ${requestId}] Found refresh token, attempting refresh`)

                    const response = await axios.post(`${API_URL}/auth/refresh`, {  // Relative path -> Vite proxy
                        refresh_token: refreshToken,
                    }, {
                        withCredentials: true,
                    })

                    const { access_token } = response.data
                    setStoredToken(access_token)
                    console.log(`[API Response ${requestId}] Token refreshed successfully`)

                    if (originalRequest.headers) {
                        originalRequest.headers.Authorization = `Bearer ${access_token}`
                    }

                    return apiClient(originalRequest)
                } else {
                    console.log(`[API Response ${requestId}] No refresh token available`)
                }
            } catch (refreshError) {
                console.error(`[API Response ${requestId}] Token refresh failed:`, refreshError)
                removeStoredToken()
                csrfManager.clearToken()
                window.location.href = '/signin'
                return Promise.reject(refreshError)
            }
        }

        return Promise.reject(error)
    }
)

// Debug helpers
if (import.meta.env.DEV) {
    (window as any).apiClient = apiClient
    console.log('[API Client] Debug: window.apiClient available for inspection')
}
