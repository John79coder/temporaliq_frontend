import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export type User = {
    id: number
    email: string
    name?: string | null
    is_verified?: boolean
    two_factor_enabled?: boolean
    isInTrial?: boolean
    isSubscribed?: boolean
}

type AuthState = {
    user: User | null
    token: string | null
    /** true when persisted state has been loaded */
    hydrated: boolean
    /** internal loading gate for auth bootstrap */
    isLoading: boolean
    /** derived flag kept in sync to avoid conditional flicker */
    isAuthenticated: boolean

    // actions
    setHydrated: (v: boolean) => void
    login: (payload: { user: User; token: string }) => void
    logout: () => void
    setUser: (user: User | null) => void
    setToken: (token: string | null) => void
    setLoading: (loading: boolean) => void
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            hydrated: false,
            isLoading: true,
            isAuthenticated: false,

            setHydrated: (v) =>
                set((state) => ({
                    hydrated: v,
                    isLoading: false,
                    // recompute from persisted values after hydration
                    isAuthenticated: Boolean(state.token),
                })),

            login: ({ user, token }) =>
                set(() => ({
                    user,
                    token,
                    isAuthenticated: true,
                    isLoading: false,
                })),

            logout: () =>
                set(() => ({
                    user: null,
                    token: null,
                    isAuthenticated: false,
                    isLoading: false,
                })),

            setUser: (user) =>
                set((state) => ({
                    user,
                    isAuthenticated: Boolean(user) || Boolean(state.token),
                })),

            setToken: (token) =>
                set(() => ({
                    token,
                    isAuthenticated: Boolean(token),
                })),

            setLoading: (loading) =>
                set(() => ({
                    isLoading: loading,
                })),
        }),
        {
            name: 'auth',
            storage: createJSONStorage(() => localStorage),
            // Persist only what’s needed
            partialize: (state) => ({ user: state.user, token: state.token }),
            onRehydrateStorage: () => (state, _error) => {
                // mark the store as ready after rehydration
                state?.setHydrated(true)
            },
        },
    ),
)

// Tiny helpers to keep components tidy
export const useAuthReady = () =>
    useAuthStore((s) => s.hydrated && !s.isLoading)

export const useIsAuthenticated = () =>
    useAuthStore((s) => s.isAuthenticated)