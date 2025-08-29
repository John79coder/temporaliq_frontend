// ============================================
// src/types/auth.ts - UPDATED TYPES
// ============================================
export interface User {
    id: string | number
    email: string
    name?: string
    avatar?: string
    provider?: 'apple' | 'email'
    is_verified: boolean
    is_subscribed?: boolean
    is_in_trial?: boolean
    has_used_free_preview?: boolean
    created_at: string
    updated_at?: string
    // Backend specific fields
    two_factor_enabled?: boolean
}

export interface AuthResponse {
    user: User
    access_token: string
    refresh_token?: string
}

export interface SignInCredentials {
    email: string
    password: string
}

export interface SignUpCredentials extends SignInCredentials {
    name?: string
}

export interface VerifyEmailRequest {
    token: string
}

export interface ResendVerificationRequest {
    email: string
}

export interface PasswordResetRequest {
    email: string
}

export interface ResetPasswordRequest {
    token: string
    new_password: string
}
