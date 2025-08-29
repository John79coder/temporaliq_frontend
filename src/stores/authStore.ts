// ============================================
// src/stores/authStore.ts - UPDATED WITH PROPER USER MAPPING
// ============================================
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { User } from '@/types/auth'

interface AuthState {
    user: User | null
    isAuthenticated: boolean
    isLoading: boolean
    token: string | null

    // Actions
    setUser: (user: User | null) => void
    setToken: (token: string | null) => void
    login: (user: User, token: string) => void
    logout: () => void
    setLoading: (loading: boolean) => void
    updateUser: (updates: Partial<User>) => void
}

export const useAuthStore = create<AuthState>()(
    devtools(
        (set) => ({
            user: null,
            isAuthenticated: false,
            isLoading: true,
            token: null,

            setUser: (user) => {
                // Map backend snake_case to frontend camelCase if needed
                const mappedUser = user ? {
                    ...user,
                    isVerified: user.is_verified,
                    isSubscribed: user.is_subscribed,
                    isInTrial: user.is_in_trial,
                    hasUsedFreePreview: user.has_used_free_preview,
                    createdAt: user.created_at,
                    updatedAt: user.updated_at,
                } : null

                set({ user: mappedUser, isAuthenticated: !!user })
            },

            setToken: (token) => {
                if (token) {
                    localStorage.setItem('access_token', token)
                } else {
                    localStorage.removeItem('access_token')
                }
                set({ token })
            },

            login: (user, token) => {
                // Map backend fields
                const mappedUser = {
                    ...user,
                    isVerified: user.is_verified,
                    isSubscribed: user.is_subscribed,
                    isInTrial: user.is_in_trial,
                    hasUsedFreePreview: user.has_used_free_preview,
                    createdAt: user.created_at,
                    updatedAt: user.updated_at,
                }

                localStorage.setItem('access_token', token)
                set({ user: mappedUser, token, isAuthenticated: true, isLoading: false })
            },

            logout: () => {
                localStorage.removeItem('access_token')
                localStorage.removeItem('refresh_token')
                localStorage.removeItem('user_data')
                set({ user: null, token: null, isAuthenticated: false })
            },

            setLoading: (isLoading) => set({ isLoading }),

            updateUser: (updates) =>
                set((state) => ({
                    user: state.user ? { ...state.user, ...updates } : null,
                })),
        }),
        {
            name: 'auth-store',
        }
    )
)
