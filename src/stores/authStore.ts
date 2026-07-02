import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { createLogger } from '@/utils/logger'

const log = createLogger('auth:store')

export type User = {
    id: string | number
    email: string
    name?: string | null
    is_verified?: boolean
    two_factor_enabled?: boolean
    isInTrial?: boolean
    isSubscribed?: boolean
    has_used_free_preview?: boolean
}

type AuthState = {
    user: User | null
    hydrated: boolean
    isLoading: boolean
    isAuthenticated: boolean

    setHydrated: (v: boolean) => void
    login: (payload: { user: User }) => void
    logout: () => void
    setUser: (user: User | null) => void
    setLoading: (loading: boolean) => void
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            hydrated: false,
            isLoading: true,
            isAuthenticated: false,

            setHydrated: (v) =>
                set((state) => {
                    log.debug('hydrated', { hasUser: Boolean(state.user) })
                    return {
                        hydrated: v,
                        isLoading: false,
                        isAuthenticated: Boolean(state.user),
                    }
                }),

            login: ({ user }) => {
                log.info('login', { userId: user.id })
                set(() => ({
                    user,
                    isAuthenticated: true,
                    isLoading: false,
                }))
            },

            logout: () => {
                log.info('logout')
                set(() => ({
                    user: null,
                    isAuthenticated: false,
                    isLoading: false,
                }))
            },

            setUser: (user) => {
                log.debug('setUser', { userId: user?.id ?? null })
                set(() => ({
                    user,
                    isAuthenticated: Boolean(user),
                }))
            },

            setLoading: (loading) =>
                set(() => ({
                    isLoading: loading,
                })),
        }),
        {
            name: 'auth',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({ user: state.user }),
            onRehydrateStorage: () => (state, _error) => {
                state?.setHydrated(true)
            },
        },
    ),
)

export const useAuthReady = () =>
    useAuthStore((s) => s.hydrated && !s.isLoading)

export const useIsAuthenticated = () =>
    useAuthStore((s) => s.isAuthenticated)