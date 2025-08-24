import { apiClient } from './client'
import type { AuthResponse, SignInCredentials, SignUpCredentials, User } from '@/types/auth'
import { API_ENDPOINTS } from '@/utils/constants'

// Mock data for development
const MOCK_USER: User = {
    id: '1',
    email: 'demo@smartscheduler.ai',
    name: 'Demo User',
    provider: 'email',
    isSubscribed: false,
    isInTrial: true,
    hasUsedFreePreview: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
}

const USE_MOCK = true // Toggle for development

export const signInWithEmail = async (credentials: SignInCredentials): Promise<AuthResponse> => {
    if (USE_MOCK) {
        await new Promise(resolve => setTimeout(resolve, 1000))

        if (credentials.email === 'demo@smartscheduler.ai' && credentials.password === 'Demo123!') {
            return {
                user: MOCK_USER,
                access_token: 'mock_jwt_token_' + Date.now(),
                refresh_token: 'mock_refresh_token_' + Date.now(),
            }
        }

        throw new Error('Invalid credentials. Try demo@smartscheduler.ai / Demo123!')
    }

    const { data } = await apiClient.post<AuthResponse>(
        API_ENDPOINTS.AUTH.SIGNIN,
        credentials
    )
    return data
}

export const signUpWithEmail = async (credentials: SignUpCredentials): Promise<AuthResponse> => {
    if (USE_MOCK) {
        await new Promise(resolve => setTimeout(resolve, 1000))

        return {
            user: {
                ...MOCK_USER,
                email: credentials.email,
                name: credentials.name,
            },
            access_token: 'mock_jwt_token_' + Date.now(),
            refresh_token: 'mock_refresh_token_' + Date.now(),
        }
    }

    const { data } = await apiClient.post<AuthResponse>(
        API_ENDPOINTS.AUTH.SIGNUP,
        credentials
    )
    return data
}

export const signInWithApple = async (authorizationCode: string): Promise<AuthResponse> => {
    if (USE_MOCK) {
        await new Promise(resolve => setTimeout(resolve, 1500))

        return {
            user: {
                ...MOCK_USER,
                provider: 'apple',
                email: 'apple.user@icloud.com',
                name: 'Apple User',
            },
            access_token: 'mock_jwt_token_apple_' + Date.now(),
            refresh_token: 'mock_refresh_token_apple_' + Date.now(),
        }
    }

    const { data } = await apiClient.post<AuthResponse>(
        API_ENDPOINTS.AUTH.APPLE,
        { code: authorizationCode }
    )
    return data
}

export const getCurrentUser = async (): Promise<User> => {
    if (USE_MOCK) {
        await new Promise(resolve => setTimeout(resolve, 500))
        return MOCK_USER
    }

    const { data } = await apiClient.get<User>(API_ENDPOINTS.AUTH.CURRENT_USER)
    return data
}

export const logout = async (): Promise<void> => {
    if (USE_MOCK) {
        await new Promise(resolve => setTimeout(resolve, 500))
        return
    }

    await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT)
}
