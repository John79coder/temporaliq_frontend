import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'
import { getStoredToken, removeStoredToken } from '@/utils/storage'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export const apiClient = axios.create({
    baseURL: API_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
})

// Request interceptor for auth token
apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = getStoredToken()
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`
        }

        // Log request in development
        if (import.meta.env.DEV) {
            console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`)
        }

        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// Response interceptor for error handling
apiClient.interceptors.response.use(
    (response) => {
        if (import.meta.env.DEV) {
            console.log(`[API Response] ${response.config.url}`, response.data)
        }
        return response
    },
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true

            try {
                // Try to refresh token
                const refreshToken = localStorage.getItem('refresh_token')
                if (refreshToken) {
                    const response = await axios.post(`${API_URL}/auth/refresh`, {
                        refresh_token: refreshToken,
                    })

                    const { access_token } = response.data
                    localStorage.setItem('access_token', access_token)

                    if (originalRequest.headers) {
                        originalRequest.headers.Authorization = `Bearer ${access_token}`
                    }

                    return apiClient(originalRequest)
                }
            } catch (refreshError) {
                // Refresh failed, redirect to login
                removeStoredToken()
                window.location.href = '/signin'
                return Promise.reject(refreshError)
            }
        }

        return Promise.reject(error)
    }
)
