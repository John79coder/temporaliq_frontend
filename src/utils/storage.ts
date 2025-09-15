// src/utils/storage.ts
// ============================================
// UPDATED STORAGE UTILITIES - Fixed for Zustand persistence
// ============================================

// === EXISTING CONSTANTS ===
const TOKEN_KEY = 'access_token'
const REFRESH_TOKEN_KEY = 'refresh_token'
const USER_KEY = 'user_data'
const AUTH_STORE_KEY = 'auth' // Zustand persist key

// === NEW CONSTANTS FOR ENHANCED FEATURES ===
const REMEMBER_ME_KEY = 'remember_me'
const THEME_KEY = 'theme'
const PREFERENCES_KEY = 'preferences'

// === FIXED TOKEN FUNCTIONS ===
export const getStoredToken = (): string | null => {
    try {
        // First check direct storage (for backward compatibility)
        const directToken = localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY)
        if (directToken) {
            return directToken
        }

        // Then check Zustand persisted auth store
        const authStoreData = localStorage.getItem(AUTH_STORE_KEY)
        if (authStoreData) {
            try {
                const parsed = JSON.parse(authStoreData)
                // Zustand persist stores the state in a 'state' property
                const token = parsed?.state?.token || parsed?.token
                if (token) {
                    return token
                }
            } catch (e) {
                console.error('Error parsing auth store data:', e)
            }
        }

        return null
    } catch (error) {
        console.error('Error reading token from storage:', error)
        return null
    }
}

// === ENHANCED: Support remember me option ===
export const setStoredToken = (token: string, rememberMe: boolean = true): void => {
    try {
        if (rememberMe) {
            localStorage.setItem(TOKEN_KEY, token)
            // Clear from session if switching to persistent
            sessionStorage.removeItem(TOKEN_KEY)
        } else {
            sessionStorage.setItem(TOKEN_KEY, token)
            // Clear from localStorage if switching to session-only
            localStorage.removeItem(TOKEN_KEY)
        }
    } catch (error) {
        console.error('Error storing token:', error)
    }
}

export const removeStoredToken = (): void => {
    try {
        localStorage.removeItem(TOKEN_KEY)
        localStorage.removeItem(REFRESH_TOKEN_KEY)
        localStorage.removeItem(USER_KEY)
        sessionStorage.removeItem(TOKEN_KEY)
        sessionStorage.removeItem(REFRESH_TOKEN_KEY)

        // Also clear from Zustand persist if needed
        const authStoreData = localStorage.getItem(AUTH_STORE_KEY)
        if (authStoreData) {
            try {
                const parsed = JSON.parse(authStoreData)
                if (parsed?.state) {
                    parsed.state.token = null
                    parsed.state.isAuthenticated = false
                    localStorage.setItem(AUTH_STORE_KEY, JSON.stringify(parsed))
                }
            } catch (e) {
                // If we can't parse it, just remove it
                localStorage.removeItem(AUTH_STORE_KEY)
            }
        }
    } catch (error) {
        console.error('Error removing tokens:', error)
    }
}

// === EXISTING USER FUNCTIONS (UNCHANGED) ===
export const getStoredUser = (): any => {
    try {
        // First check direct storage
        const directUser = localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY)
        if (directUser) {
            return JSON.parse(directUser)
        }

        // Then check Zustand persisted auth store
        const authStoreData = localStorage.getItem(AUTH_STORE_KEY)
        if (authStoreData) {
            try {
                const parsed = JSON.parse(authStoreData)
                const user = parsed?.state?.user || parsed?.user
                if (user) {
                    return user
                }
            } catch (e) {
                console.error('Error parsing auth store data for user:', e)
            }
        }

        return null
    } catch (error) {
        console.error('Error reading user from storage:', error)
        return null
    }
}

export const setStoredUser = (user: any, rememberMe: boolean = true): void => {
    try {
        const userStr = JSON.stringify(user)
        if (rememberMe) {
            localStorage.setItem(USER_KEY, userStr)
            sessionStorage.removeItem(USER_KEY)
        } else {
            sessionStorage.setItem(USER_KEY, userStr)
            localStorage.removeItem(USER_KEY)
        }
    } catch (error) {
        console.error('Error storing user:', error)
    }
}

// === EXISTING REFRESH TOKEN FUNCTIONS ===
export const getRefreshToken = (): string | null => {
    try {
        return localStorage.getItem(REFRESH_TOKEN_KEY) || sessionStorage.getItem(REFRESH_TOKEN_KEY)
    } catch (error) {
        console.error('Error reading refresh token:', error)
        return null
    }
}

export const setRefreshToken = (token: string, rememberMe: boolean = true): void => {
    try {
        if (rememberMe) {
            localStorage.setItem(REFRESH_TOKEN_KEY, token)
            sessionStorage.removeItem(REFRESH_TOKEN_KEY)
        } else {
            sessionStorage.setItem(REFRESH_TOKEN_KEY, token)
            localStorage.removeItem(REFRESH_TOKEN_KEY)
        }
    } catch (error) {
        console.error('Error storing refresh token:', error)
    }
}

// === NEW FUNCTIONS FOR ENHANCED FEATURES ===

// Clear all auth data - enhanced version
export const clearAuthData = (): void => {
    try {
        // Clear all auth-related items from both storages
        localStorage.removeItem(TOKEN_KEY)
        localStorage.removeItem(REFRESH_TOKEN_KEY)
        localStorage.removeItem(USER_KEY)
        sessionStorage.removeItem(TOKEN_KEY)
        sessionStorage.removeItem(REFRESH_TOKEN_KEY)
        sessionStorage.removeItem(USER_KEY)

        // Clear any 2FA temporary data
        sessionStorage.removeItem('2fa_temp_token')
        sessionStorage.removeItem('2fa_user')
        sessionStorage.removeItem('intended_path')

        // Clear Zustand persisted auth
        localStorage.removeItem(AUTH_STORE_KEY)
    } catch (error) {
        console.error('Error clearing auth data:', error)
    }
}

// Remember me preference
export const getRememberMe = (): boolean => {
    try {
        return localStorage.getItem(REMEMBER_ME_KEY) === 'true'
    } catch (error) {
        console.error('Error reading remember me preference:', error)
        return false
    }
}

export const setRememberMe = (value: boolean): void => {
    try {
        localStorage.setItem(REMEMBER_ME_KEY, String(value))
    } catch (error) {
        console.error('Error storing remember me preference:', error)
    }
}

// Theme preference
export const getStoredTheme = (): 'light' | 'dark' | 'system' => {
    try {
        const theme = localStorage.getItem(THEME_KEY)
        if (theme === 'light' || theme === 'dark' || theme === 'system') {
            return theme
        }
        return 'system'
    } catch (error) {
        console.error('Error reading theme preference:', error)
        return 'system'
    }
}

export const setStoredTheme = (theme: 'light' | 'dark' | 'system'): void => {
    try {
        localStorage.setItem(THEME_KEY, theme)
    } catch (error) {
        console.error('Error storing theme preference:', error)
    }
}

// User preferences
export const getStoredPreferences = (): Record<string, any> => {
    try {
        const prefs = localStorage.getItem(PREFERENCES_KEY)
        return prefs ? JSON.parse(prefs) : {}
    } catch (error) {
        console.error('Error reading preferences:', error)
        return {}
    }
}

export const setStoredPreferences = (preferences: Record<string, any>): void => {
    try {
        localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences))
    } catch (error) {
        console.error('Error storing preferences:', error)
    }
}

// Helper to sync auth store with direct storage (for migration)
export const syncAuthStorage = (): void => {
    try {
        const authStoreData = localStorage.getItem(AUTH_STORE_KEY)
        if (authStoreData) {
            const parsed = JSON.parse(authStoreData)
            const token = parsed?.state?.token || parsed?.token
            const user = parsed?.state?.user || parsed?.user

            // Sync to direct storage for backward compatibility
            if (token && !localStorage.getItem(TOKEN_KEY)) {
                localStorage.setItem(TOKEN_KEY, token)
            }
            if (user && !localStorage.getItem(USER_KEY)) {
                localStorage.setItem(USER_KEY, JSON.stringify(user))
            }
        }
    } catch (error) {
        console.error('Error syncing auth storage:', error)
    }
}