// src/api/auth.ts
import { apiClient } from './client'
import { csrfManager } from './csrf'
import type { AuthResponse, SignInCredentials, SignUpCredentials, User } from '@/types/auth'
import { API_ENDPOINTS } from '@/utils/constants'

// Debug helper
const logAuthAction = (action: string, data?: any) => {
    console.log(`[AUTH] ${action}`, {
        timestamp: new Date().toISOString(),
        csrfStats: csrfManager.getStats(),
        cookies: document.cookie,
        data,
    })
}

export const signUpWithEmail = async (credentials: SignUpCredentials): Promise<AuthResponse> => {
    logAuthAction('Starting signUpWithEmail', { email: credentials.email })

    try {
        const { data } = await apiClient.post(
            API_ENDPOINTS.AUTH.SIGNUP,
            {
                email: credentials.email,
                password: credentials.password,
            }
        )

        logAuthAction('Signup successful', { userId: data.user?.id })

        return {
            user: data.user,
            access_token: data.jwt,
            refresh_token: data.refresh_token
        }
    } catch (error: any) {
        logAuthAction('Signup failed', {
            error: error.message,
            response: error.response?.data
        })

        if (error.response?.data?.detail) {
            throw new Error(error.response.data.detail)
        }
        throw new Error('Failed to sign up. Please try again.')
    }
}

export const signInWithEmail = async (credentials: SignInCredentials): Promise<AuthResponse> => {
    logAuthAction('Starting signInWithEmail', { email: credentials.email })

    try {
        const { data } = await apiClient.post(
            API_ENDPOINTS.AUTH.SIGNIN,
            {
                email: credentials.email,
                password: credentials.password,
            }
        )

        logAuthAction('Signin successful', { userId: data.user?.id })

        return {
            user: data.user,
            access_token: data.jwt,
            refresh_token: data.refresh_token
        }
    } catch (error: any) {
        logAuthAction('Signin failed', {
            error: error.message,
            status: error.response?.status,
            response: error.response?.data
        })

        if (error.response?.data?.detail) {
            throw new Error(error.response.data.detail)
        }
        if (error.response?.status === 403) {
            throw new Error('Account not verified. Please check your email.')
        }
        throw new Error('Invalid email or password')
    }
}

export const signInWithApple = async (): Promise<AuthResponse> => {
    logAuthAction('Starting Apple Sign-In redirect')
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/apple`
    return Promise.reject(new Error('Redirecting to Apple Sign-In...'))
}

export const verifyEmail = async (token: string): Promise<AuthResponse> => {
    logAuthAction('Starting email verification', { tokenPrefix: token.substring(0, 10) })

    try {
        const { data } = await apiClient.post(
            API_ENDPOINTS.AUTH.VERIFY,
            { token }
        )

        logAuthAction('Email verification successful', { userId: data.user?.id })

        return {
            user: data.user,
            access_token: data.jwt,
            refresh_token: data.refresh_token
        }
    } catch (error: any) {
        logAuthAction('Email verification failed', {
            error: error.message,
            response: error.response?.data
        })

        if (error.response?.data?.detail) {
            throw new Error(error.response.data.detail)
        }
        throw new Error('Invalid or expired verification token')
    }
}

export const resendVerificationEmail = async (email: string): Promise<void> => {
    logAuthAction('Resending verification email', { email })

    try {
        await apiClient.post(
            API_ENDPOINTS.AUTH.RESEND_VERIFICATION,
            { email }
        )

        logAuthAction('Verification email resent successfully')
    } catch (error: any) {
        logAuthAction('Failed to resend verification email', {
            error: error.message,
            response: error.response?.data
        })

        if (error.response?.data?.detail) {
            throw new Error(error.response.data.detail)
        }
        throw new Error('Failed to resend verification email')
    }
}

export const requestPasswordReset = async (email: string): Promise<void> => {
    logAuthAction('Requesting password reset', { email })

    try {
        await apiClient.post(
            API_ENDPOINTS.AUTH.REQUEST_RESET,
            { email }
        )

        logAuthAction('Password reset email sent successfully')
    } catch (error: any) {
        logAuthAction('Failed to send password reset email', {
            error: error.message,
            response: error.response?.data
        })

        if (error.response?.data?.detail) {
            throw new Error(error.response.data.detail)
        }
        throw new Error('Failed to send password reset email')
    }
}

export const resetPassword = async (token: string, newPassword: string): Promise<void> => {
    logAuthAction('Resetting password', { tokenPrefix: token.substring(0, 10) })

    try {
        await apiClient.post(
            API_ENDPOINTS.AUTH.RESET_PASSWORD,
            {
                token,
                new_password: newPassword
            }
        )

        logAuthAction('Password reset successful')
    } catch (error: any) {
        logAuthAction('Password reset failed', {
            error: error.message,
            response: error.response?.data
        })

        if (error.response?.data?.detail) {
            throw new Error(error.response.data.detail)
        }
        throw new Error('Failed to reset password')
    }
}

export const refreshToken = async (refreshToken: string): Promise<AuthResponse> => {
    logAuthAction('Refreshing access token')

    try {
        const { data } = await apiClient.post(
            API_ENDPOINTS.AUTH.REFRESH,
            { refresh_token: refreshToken }
        )

        logAuthAction('Token refresh successful')

        return {
            user: data.user,
            access_token: data.access_token,
            refresh_token: data.refresh_token
        }
    } catch (error: any) {
        logAuthAction('Token refresh failed', {
            error: error.message,
            response: error.response?.data
        })

        throw new Error('Session expired. Please sign in again.')
    }
}

export const getCurrentUser = async (): Promise<User> => {
    logAuthAction('Fetching current user')

    try {
        const { data } = await apiClient.get(API_ENDPOINTS.AUTH.CURRENT_USER)

        logAuthAction('Current user fetched', { userId: data.user?.id })

        return data.user
    } catch (error: any) {
        logAuthAction('Failed to fetch current user', {
            error: error.message,
            response: error.response?.data
        })

        throw new Error('Failed to fetch user data. Please sign in again.')
    }
}

export const logout = async (): Promise<void> => {
    logAuthAction('Starting logout')

    try {
        await apiClient.post(
            API_ENDPOINTS.AUTH.LOGOUT,
            {}
        )

        logAuthAction('Logout successful')
    } catch (error) {
        // Logout should always succeed on frontend
        logAuthAction('Logout error (proceeding anyway)', { error })
    } finally {
        // Always clear local state
        csrfManager.clearToken()
        logAuthAction('Local state cleared')
    }
}