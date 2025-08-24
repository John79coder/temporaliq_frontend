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
}

export const useAuthStore = create<AuthState>()(
    devtools(
        (set) => ({
            user: null,
            isAuthenticated: false,
            isLoading: true,
            token: null,

            setUser: (user) =>
                set({ user, isAuthenticated: !!user }),

            setToken: (token) =>
                set({ token }),

            login: (user, token) => {
                localStorage.setItem('access_token', token)
                set({ user, token, isAuthenticated: true })
            },

            logout: () => {
                localStorage.removeItem('access_token')
                localStorage.removeItem('refresh_token')
                set({ user: null, token: null, isAuthenticated: false })
            },

            setLoading: (isLoading) =>
                set({ isLoading }),
        }),
        {
            name: 'auth-store',
        }
    )
)
