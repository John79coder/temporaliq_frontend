// src/api/auth.ts
import { apiClient } from './client'
import { csrfManager } from './csrf'
import type { AuthResponse, SignInCredentials, SignUpCredentials, User } from '@/types/auth'
import { API_ENDPOINTS } from '@/utils/constants'
import { useAuthStore } from '@/stores/authStore'
import { setStoredUser } from '@/utils/storage'
import { clearAuthData } from '@/utils/storage'
import { createLogger, fingerprint } from '@/utils/logger'

const log = createLogger('auth')

interface ResetPasswordResponse {
    message: string
    user?: User
}

export interface SignUpResponse {
    message: string
}

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
    user_id?: string
}

export const signUpWithEmail = async (credentials: SignUpCredentials): Promise<SignUpResponse> => {
    log.debug('signup:start', { email: credentials.email })

    try {
        const { data } = await apiClient.post(
            API_ENDPOINTS.AUTH.SIGNUP,
            {
                email: credentials.email,
                password: credentials.password,
            }
        )

        log.info('signup:success')

        return {
            message: data.message
        }

    } catch (error: any) {
        log.warn('signup:failed', { status: error.response?.status, detail: error.response?.data?.detail })

        if (error.response?.data?.detail) {
            throw new Error(error.response.data.detail)
        }
        throw new Error('Failed to sign up. Please try again.')
    }
}

export const signInWithEmail = async (credentials: SignInCredentials, rememberMe: boolean = true): Promise<AuthResponseWith2FA> => {

    log.debug('signin:start', { email: credentials.email })

    try {
        const { data } = await apiClient.post(
            API_ENDPOINTS.AUTH.SIGNIN,
            {
                email: credentials.email,
                password: credentials.password,
            }
        )

        log.debug('signin:response', {
            requires2FA: data.requires_two_factor,
            userId: data.user?.id || data.user_id,
        })

        if (data.requires_two_factor === true) {
            log.info('signin:2fa_required')
            return {
                user: data.user || { id: data.user_id, email: credentials.email, is_verified: true },
                requires_2fa: true,
                user_id: String(data.user_id || data.user?.id)
            }
        }

        if (!data.user) {
            throw new Error('No user received from login')
        }

        setStoredUser(data.user, rememberMe)
        useAuthStore.getState().login({ user: data.user })

        log.info('signin:success', { userId: data.user.id })

        return {
            user: data.user,
        }
    } catch (error: any) {
        log.warn('signin:failed', { status: error.response?.status })

        if (error.response?.data?.detail) {
            throw new Error(error.response.data.detail)
        }
        if (error.response?.status === 403) {
            throw new Error('Account not verified. Please check your email.')
        }
        throw new Error(error.response?.data?.message || 'Failed to sign in. Please try again.')
    }
}

export const verifyEmail = async (token: string): Promise<AuthResponse> => {
    log.debug('verifyEmail:start', { tokenPreview: fingerprint(token) })

    try {
        const { data } = await apiClient.post(
            API_ENDPOINTS.AUTH.VERIFY,
            { token }
        )

        log.info('verifyEmail:success', { userId: data.user?.id })

        if (data.user) {
            setStoredUser(data.user)
        }

        return {
            user: data.user,
        }
    } catch (error: any) {
        log.warn('verifyEmail:failed', { status: error.response?.status })

        if (error.response?.data?.detail) {
            throw new Error(error.response.data.detail)
        }
        throw new Error('Failed to verify email. Token may be invalid or expired.')
    }
}

export const resendVerificationEmail = async (email: string): Promise<{ message: string }> => {
    log.debug('resendVerification:start', { email })

    try {
        const { data } = await apiClient.post(
            API_ENDPOINTS.AUTH.RESEND_VERIFICATION,
            { email }
        )

        log.info('resendVerification:success')

        return data
    } catch (error: any) {
        log.warn('resendVerification:failed', { status: error.response?.status })

        if (error.response?.data?.detail) {
            throw new Error(error.response.data.detail)
        }
        throw new Error('Failed to resend verification email. Please try again.')
    }
}

export const requestPasswordReset = async (email: string): Promise<{ message: string }> => {
    log.debug('passwordResetRequest:start', { email })

    try {
        const { data } = await apiClient.post(
            API_ENDPOINTS.AUTH.REQUEST_RESET,
            { email }
        )

        log.info('passwordResetRequest:success')

        return data
    } catch (error: any) {
        log.warn('passwordResetRequest:failed', { status: error.response?.status })

        if (error.response?.data?.detail) {
            throw new Error(error.response.data.detail)
        }
        throw new Error('Failed to request password reset. Please try again.')
    }
}

export const resetPassword = async (token: string, newPassword: string): Promise<ResetPasswordResponse> => {
    log.debug('passwordReset:start', { tokenPreview: fingerprint(token) })

    try {
        const { data } = await apiClient.post(
            API_ENDPOINTS.AUTH.RESET_PASSWORD,
            { token, new_password: newPassword }
        )

        log.info('passwordReset:success', { userId: data.user?.id })

        if (data.user) {
            setStoredUser(data.user)
            useAuthStore.getState().login({ user: data.user })
        }

        return data
    } catch (error: any) {
        log.warn('passwordReset:failed', { status: error.response?.status })

        if (error.response?.data?.detail) {
            throw new Error(error.response.data.detail)
        }
        throw new Error('Failed to reset password. Token may be invalid or expired.')
    }
}

export const refreshToken = async (): Promise<AuthResponse> => {
    log.debug('refresh:start')

    try {
        const { data } = await apiClient.post(
            API_ENDPOINTS.AUTH.REFRESH,
            {}
        )

        log.info('refresh:success', { userId: data.user?.id })

        if (data.user) {
            setStoredUser(data.user)
            useAuthStore.getState().setUser(data.user)
        }

        return {
            user: data.user,
        }
    } catch (error: any) {
        log.warn('refresh:failed', { status: error.response?.status })

        throw new Error('Session expired. Please sign in again.')
    }
}

export const getCurrentUser = async (): Promise<User> => {
    log.debug('getCurrentUser:start')

    try {
        const { data } = await apiClient.get(API_ENDPOINTS.AUTH.CURRENT_USER)

        log.debug('getCurrentUser:success', { userId: data.user?.id })

        if (data.user) {
            setStoredUser(data.user)
            useAuthStore.getState().setUser(data.user)
        }

        return data.user
    } catch (error: any) {
        log.warn('getCurrentUser:failed', { status: error.response?.status })

        throw new Error('Failed to fetch user data. Please sign in again.')
    }
}

export const logout = async (): Promise<void> => {
    log.debug('logout:start')

    try {
        await apiClient.post(
            API_ENDPOINTS.AUTH.LOGOUT,
            {}
        )

        log.info('logout:success')
    } catch (error: any) {
        log.warn('logout:server_error_proceeding_anyway', { status: error.response?.status })
    } finally {
        csrfManager.clearToken()

        clearAuthData()

        useAuthStore.getState().logout()

        log.debug('logout:local_state_cleared')
    }
}

export const signInWithApple = async (data: AppleSignInData): Promise<AuthResponseWith2FA> => {
    log.debug('appleSignIn:start', { hasIdToken: !!data.id_token, hasAuthCode: !!data.authorization_code })

    try {
        const response = await apiClient.post(API_ENDPOINTS.AUTH.APPLE, data)

        log.debug('appleSignIn:response', {
            userId: response.data.user?.id,
            requires2FA: response.data.requires_two_factor
        })

        if (response.data.requires_two_factor) {
            return {
                user: response.data.user,
                requires_2fa: true,
                user_id: String(response.data.user_id ?? response.data.user?.id)
            }
        }

        if (response.data.user) {
            setStoredUser(response.data.user)
            useAuthStore.getState().login({ user: response.data.user })
        }

        log.info('appleSignIn:success', { userId: response.data.user?.id })

        return {
            user: response.data.user,
        }
    } catch (error: any) {
        log.warn('appleSignIn:failed', { status: error.response?.status })

        if (error.response?.data?.detail) {
            throw new Error(error.response.data.detail)
        }
        throw new Error('Failed to sign in with Apple. Please try again.')
    }
}

export const setup2FA = async (): Promise<TwoFactorSetupResponse> => {
    log.debug('2fa:setup_start')

    try {
        const response = await apiClient.get('/auth/2fa/setup')
        log.info('2fa:setup_data_received')
        return response.data
    } catch (error: any) {
        log.warn('2fa:setup_failed', { status: error.response?.status })
        throw new Error('Failed to setup 2FA. Please try again.')
    }
}

export const verify2FASetup = async (data: TwoFactorSetupData): Promise<TwoFactorEnableResponse> => {
    log.debug('2fa:setup_verify_start')

    try {
        const response = await apiClient.post('/auth/2fa/setup/verify', data)
        log.info('2fa:enabled')
        return response.data
    } catch (error: any) {
        log.warn('2fa:setup_verify_failed', { status: error.response?.status })

        if (error.response?.status === 400) {
            throw new Error('Invalid verification code. Please try again.')
        }
        throw new Error('Failed to enable 2FA. Please try again.')
    }
}

export const verify2FA = async (data: TwoFactorVerifyData): Promise<AuthResponse> => {
    log.debug('2fa:verify_start')

    try {
        const response = await apiClient.post('/auth/2fa/verify', data)
        log.info('2fa:verify_success')

        if (response.data.user) {
            setStoredUser(response.data.user)
            useAuthStore.getState().login({ user: response.data.user })
        }

        return {
            user: response.data.user,
        }
    } catch (error: any) {
        log.warn('2fa:verify_failed', { status: error.response?.status })

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
    log.debug('2fa:disable_start')

    try {
        const response = await apiClient.delete('/auth/2fa')
        log.info('2fa:disabled')
        return response.data
    } catch (error: any) {
        log.warn('2fa:disable_failed', { status: error.response?.status })
        throw new Error('Failed to disable 2FA. Please try again.')
    }
}

export const getBackupCodesInfo = async (): Promise<{ codes_remaining: number; two_factor_enabled: boolean }> => {
    log.debug('2fa:backup_codes_info_start')

    try {
        const response = await apiClient.get('/auth/2fa/status')

        log.debug('2fa:backup_codes_info_received', { enabled: response.data.enabled, codesRemaining: response.data.codes_remaining })

        return {
            two_factor_enabled: response.data.enabled,
            codes_remaining: response.data.codes_remaining
        }

    } catch (error: any) {
        log.warn('2fa:backup_codes_info_failed', { status: error.response?.status })

        if (error.response?.status === 401) {
            throw error
        }

        log.warn('2fa:backup_codes_info_defaulting_disabled')
        return { codes_remaining: 0, two_factor_enabled: false }
    }
}

export const regenerateBackupCodes = async (): Promise<{ message: string; backup_codes: string[] }> => {
    log.debug('2fa:backup_codes_regenerate_start')

    try {
        const response = await apiClient.post('/auth/2fa/backup-codes')
        log.info('2fa:backup_codes_regenerated')
        return response.data
    } catch (error: any) {
        log.warn('2fa:backup_codes_regenerate_failed', { status: error.response?.status })
        throw new Error('Failed to regenerate backup codes. Please try again.')
    }
}

export const getOnboardingSteps = async (): Promise<{ steps: Array<{ step: number; title: string; description: string }> }> => {
    log.debug('onboarding:steps_start')

    try {
        const response = await apiClient.get('/auth/onboarding')
        log.debug('onboarding:steps_received')
        return response.data
    } catch (error: any) {
        log.warn('onboarding:steps_failed', { status: error.response?.status })
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