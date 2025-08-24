export interface User {
    id: string
    email: string
    name?: string
    avatar?: string
    provider: 'apple' | 'email'
    isSubscribed: boolean
    isInTrial: boolean
    hasUsedFreePreview: boolean
    createdAt: string
    updatedAt: string
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
    name: string
}
