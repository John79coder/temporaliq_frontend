// src/api/auth.ts
import { apiClient } from './client'
import { csrfManager } from './csrf'
import type { AuthResponse, SignInCredentials, SignUpCredentials, User } from '@/types/auth'
import { API_ENDPOINTS } from '@/utils/constants'

interface ResetPasswordResponse {
    message: string
    user?: User
    jwt?: string
}

export interface SignUpResponse {
    message: string
}

// === NEW INTERFACES FOR APPLE SIGN-IN AND 2FA ===
export interface AppleSignInData {
    id_token?: string
    authorization_code?: string
    user_info?: {
        email?: string
        name?: {
            firstName?: string
            lastName?: string
        }
    }
}

export interface TwoFactorSetupData {
    code: string
}

export interface TwoFactorVerifyData {
    code: string
    user_id?: string | number
    temp_token?: string
}

export interface TwoFactorSetupResponse {
    qr_code: string
    manual_entry_key: string
    issuer: string
}

export interface TwoFactorEnableResponse {
    success: boolean
    backup_codes: string[]
}

export interface AuthResponseWith2FA extends AuthResponse {
    requires_2fa?: boolean
    temp_token?: string
}
// === END NEW INTERFACES ===

// Debug helper
const logAuthAction = (action: string, data?: any) => {
    console.log(`[AUTH] ${action}`, {
        timestamp: new Date().toISOString(),
        csrfStats: csrfManager.getStats(),
        cookies: document.cookie,
        data,
    })
}

export const signUpWithEmail = async (credentials: SignUpCredentials): Promise<SignUpResponse> => {

    logAuthAction('Starting signUpWithEmail', { email: credentials.email })

    try {
        const { data } = await apiClient.post(
            API_ENDPOINTS.AUTH.SIGNUP,
            {
                email: credentials.email,
                password: credentials.password,
            }
        )

        logAuthAction('Signup successful', { message: data.message })

        return {
            message: data.message
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

export const signInWithEmail = async (credentials: SignInCredentials): Promise<AuthResponseWith2FA> => {
    logAuthAction('Starting signInWithEmail', { email: credentials.email })

    try {
        const { data } = await apiClient.post(
            API_ENDPOINTS.AUTH.SIGNIN,
            {
                email: credentials.email,
                password: credentials.password,
            }
        )

        logAuthAction('Signin response', {
            hasJwt: !!data.jwt,
            requires2FA: data.requires_2fa,
            userId: data.user?.id || data.user_id,
            fullResponse: data   // For debugging
        })

        // 2FA IS REQUIRED
        if (data.requires_two_factor === true) {
            logAuthAction('2FA required - navigating to verification')
            return {
                user: data.user || { id: data.user_id, email: credentials.email, is_verified: true },
                access_token: '',
                refresh_token: '',
                requires_2fa: true,
                temp_token: String(data.user_id || data.user?.id)
            }
        }

        // NORMAL LOGIN
        if (!data.jwt) {
            throw new Error('No authentication token received')
        }

        return {
            user: data.user,
            access_token: data.jwt,
            refresh_token: data.refresh_token || ''
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
        throw new Error(error.response?.data?.message || 'Failed to sign in. Please try again.')
    }
}

// === EXISTING FUNCTIONS (UNCHANGED) ===
export const verifyEmail = async (token: string): Promise<AuthResponse> => {
    logAuthAction('Verifying email', { token: token.substring(0, 10) + '...' })

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
        throw new Error('Failed to verify email. Token may be invalid or expired.')
    }
}

export const resendVerificationEmail = async (email: string): Promise<{ message: string }> => {
    logAuthAction('Resending verification email', { email })

    try {
        const { data } = await apiClient.post(
            API_ENDPOINTS.AUTH.RESEND_VERIFICATION,
            { email }
        )

        logAuthAction('Verification email resent')

        return data
    } catch (error: any) {
        logAuthAction('Resend verification failed', {
            error: error.message,
            response: error.response?.data
        })

        if (error.response?.data?.detail) {
            throw new Error(error.response.data.detail)
        }
        throw new Error('Failed to resend verification email. Please try again.')
    }
}

export const requestPasswordReset = async (email: string): Promise<{ message: string }> => {
    logAuthAction('Requesting password reset', { email })

    try {
        const { data } = await apiClient.post(
            API_ENDPOINTS.AUTH.REQUEST_RESET,
            { email }
        )

        logAuthAction('Password reset email sent')

        return data
    } catch (error: any) {
        logAuthAction('Password reset request failed', {
            error: error.message,
            response: error.response?.data
        })

        if (error.response?.data?.detail) {
            throw new Error(error.response.data.detail)
        }
        throw new Error('Failed to request password reset. Please try again.')
    }
}

export const resetPassword = async (token: string, newPassword: string): Promise<ResetPasswordResponse> => {
    logAuthAction('Resetting password', { token: token.substring(0, 10) + '...' })

    try {
        const { data } = await apiClient.post(
            API_ENDPOINTS.AUTH.RESET_PASSWORD,
            { token, new_password: newPassword }
        )

        logAuthAction('Password reset successful', { userId: data.user?.id })

        return data
    } catch (error: any) {
        logAuthAction('Password reset failed', {
            error: error.message,
            response: error.response?.data
        })

        if (error.response?.data?.detail) {
            throw new Error(error.response.data.detail)
        }
        throw new Error('Failed to reset password. Token may be invalid or expired.')
    }
}

export const refreshToken = async ( refreshToken: string): Promise<AuthResponse> => {
    logAuthAction('Refreshing token')

    try {
        const { data } = await apiClient.post(
            API_ENDPOINTS.AUTH.REFRESH,
            { refresh_token: refreshToken }
        )

        logAuthAction('Token refreshed successfully')

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

// === NEW FUNCTIONS FOR APPLE SIGN-IN ===
export const signInWithApple = async (data: AppleSignInData): Promise<AuthResponseWith2FA> => {
    logAuthAction('Starting Apple Sign In', { hasIdToken: !!data.id_token, hasAuthCode: !!data.authorization_code })

    try {
        const response = await apiClient.post('/auth/apple-signin', data)

        logAuthAction('Apple Sign In response', {
            userId: response.data.user?.id,
            requires2FA: response.data.requires_2fa
        })

        // Check if 2FA is required
        if (response.data.requires_2fa) {
            return {
                user: response.data.user,
                access_token: '',
                refresh_token: '',
                requires_2fa: true,
                temp_token: response.data.temp_token
            }
        }

        return {
            user: response.data.user,
            access_token: response.data.jwt,
            refresh_token: response.data.refresh_token
        }
    } catch (error: any) {
        logAuthAction('Apple Sign In failed', {
            error: error.message,
            response: error.response?.data
        })

        if (error.response?.data?.detail) {
            throw new Error(error.response.data.detail)
        }
        throw new Error('Failed to sign in with Apple. Please try again.')
    }
}

// === NEW FUNCTIONS FOR 2FA ===
export const setup2FA = async (): Promise<TwoFactorSetupResponse> => {
    logAuthAction('Fetching 2FA setup')

    try {
        const response = await apiClient.get('/auth/2fa/setup')
        logAuthAction('2FA setup data received')
        return response.data
    } catch (error: any) {
        logAuthAction('2FA setup failed', {
            error: error.message,
            response: error.response?.data
        })
        throw new Error('Failed to setup 2FA. Please try again.')
    }
}

export const verify2FASetup = async (data: TwoFactorSetupData): Promise<TwoFactorEnableResponse> => {
    logAuthAction('Verifying 2FA setup')

    try {
        const response = await apiClient.post('/auth/2fa/setup/verify', data)
        logAuthAction('2FA enabled successfully')
        return response.data
    } catch (error: any) {
        logAuthAction('2FA setup verification failed', {
            error: error.message,
            response: error.response?.data
        })

        if (error.response?.status === 400) {
            throw new Error('Invalid verification code. Please try again.')
        }
        throw new Error('Failed to enable 2FA. Please try again.')
    }
}

export const verify2FA = async (data: TwoFactorVerifyData): Promise<AuthResponse> => {
    logAuthAction('Verifying 2FA code')

    try {
        const response = await apiClient.post('/auth/2fa/verify', data)
        logAuthAction('2FA verification successful')

        return {
            user: response.data.user,
            access_token: response.data.jwt,
            refresh_token: response.data.refresh_token
        }
    } catch (error: any) {
        logAuthAction('2FA verification failed', {
            error: error.message,
            response: error.response?.data
        })

        if (error.response?.status === 401) {
            throw new Error('Session expired. Please login again.')
        }
        if (error.response?.status === 400) {
            throw new Error('Invalid code. Please try again.')
        }
        throw new Error('2FA verification failed. Please try again.')
    }
}

export const disable2FA = async (): Promise<{ message: string }> => {
    logAuthAction('Disabling 2FA')

    try {
        const response = await apiClient.delete('/auth/2fa')
        logAuthAction('2FA disabled successfully')
        return response.data
    } catch (error: any) {
        logAuthAction('Failed to disable 2FA', {
            error: error.message,
            response: error.response?.data
        })
        throw new Error('Failed to disable 2FA. Please try again.')
    }
}


export const getBackupCodesInfo = async (): Promise<{ codes_remaining: number; two_factor_enabled: boolean }> => {
    logAuthAction('Fetching backup codes info')

    try {
        const response = await apiClient.get('/auth/2fa/status')

        logAuthAction('Backup codes info received', response.data)

        return {
            two_factor_enabled: response.data.enabled,
            codes_remaining: response.data.codes_remaining
        }

    } catch (error: any) {
        logAuthAction('Failed to fetch backup codes info', {
            error: error.message,
            response: error.response?.data
        })

        // Only re-throw 401 errors for re-authentication
        if (error.response?.status === 401) {
            throw error
        }

        // For any other error, return safe defaults
        console.error('Error fetching 2FA status, defaulting to disabled')
        return { codes_remaining: 0, two_factor_enabled: false }
    }
}


export const regenerateBackupCodes = async (): Promise<{ message: string; backup_codes: string[] }> => {
    logAuthAction('Regenerating backup codes')

    try {
        const response = await apiClient.post('/auth/2fa/backup-codes')
        logAuthAction('Backup codes regenerated')
        return response.data
    } catch (error: any) {
        logAuthAction('Failed to regenerate backup codes', {
            error: error.message,
            response: error.response?.data
        })
        throw new Error('Failed to regenerate backup codes. Please try again.')
    }
}

export const getOnboardingSteps = async (): Promise<{ steps: Array<{ step: number; title: string; description: string }> }> => {
    logAuthAction('Fetching onboarding steps')

    try {
        const response = await apiClient.get('/auth/onboarding')
        logAuthAction('Onboarding steps received')
        return response.data
    } catch (error: any) {
        logAuthAction('Failed to fetch onboarding steps', {
            error: error.message,
            response: error.response?.data
        })
        // Return default steps if API fails
        return {
            steps: [
                { step: 1, title: "Sign Up", description: "Create your account" },
                { step: 2, title: "Verify Email", description: "Confirm your email address" },
                { step: 3, title: "Connect Notion", description: "Link your Notion workspace" },
                { step: 4, title: "Connect Calendar", description: "Connect your calendar" },
                { step: 5, title: "Review", description: "Review and confirm" }
            ]
        }
    }
}