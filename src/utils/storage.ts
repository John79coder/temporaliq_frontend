// src/utils/storage.ts
import { createLogger } from './logger'

const log = createLogger('utils:storage')

const USER_KEY = 'user_data'
const AUTH_STORE_KEY = 'auth'

const REMEMBER_ME_KEY = 'remember_me'
const THEME_KEY = 'theme'
const PREFERENCES_KEY = 'preferences'

export const getStoredUser = (): any => {
    try {
        const directUser = localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY)
        if (directUser) {
            return JSON.parse(directUser)
        }

        const authStoreData = localStorage.getItem(AUTH_STORE_KEY)
        if (authStoreData) {
            const parsed = JSON.parse(authStoreData)
            const user = parsed?.state?.user || parsed?.user
            if (user) {
                return user
            }
        }

        return null
    } catch (error) {
        log.warn('Failed to read stored user', { error: (error as Error).message })
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
        log.warn('Failed to store user', { error: (error as Error).message })
    }
}

export const clearAuthData = (): void => {
    try {
        localStorage.removeItem(USER_KEY)
        sessionStorage.removeItem(USER_KEY)

        localStorage.removeItem(REMEMBER_ME_KEY)

        sessionStorage.removeItem('user_id')
        sessionStorage.removeItem('2fa_user')
        sessionStorage.removeItem('intended_path')

        localStorage.removeItem(AUTH_STORE_KEY)
    } catch (error) {
        log.warn('Failed to clear auth data', { error: (error as Error).message })
    }
}

export const getRememberMe = (): boolean => {
    try {
        return localStorage.getItem(REMEMBER_ME_KEY) === 'true'
    } catch (error) {
        log.warn('Failed to read remember-me preference', { error: (error as Error).message })
        return false
    }
}

export const setRememberMe = (value: boolean): void => {
    try {
        localStorage.setItem(REMEMBER_ME_KEY, String(value))
    } catch (error) {
        log.warn('Failed to store remember-me preference', { error: (error as Error).message })
    }
}

export const getStoredTheme = (): 'light' | 'dark' | 'system' => {
    try {
        const theme = localStorage.getItem(THEME_KEY)
        if (theme === 'light' || theme === 'dark' || theme === 'system') {
            return theme
        }
        return 'system'
    } catch (error) {
        log.warn('Failed to read theme preference', { error: (error as Error).message })
        return 'system'
    }
}

export const setStoredTheme = (theme: 'light' | 'dark' | 'system'): void => {
    try {
        localStorage.setItem(THEME_KEY, theme)
    } catch (error) {
        log.warn('Failed to store theme preference', { error: (error as Error).message })
    }
}

export const getStoredPreferences = (): Record<string, any> => {
    try {
        const prefs = localStorage.getItem(PREFERENCES_KEY)
        return prefs ? JSON.parse(prefs) : {}
    } catch (error) {
        log.warn('Failed to read preferences', { error: (error as Error).message })
        return {}
    }
}

export const setStoredPreferences = (preferences: Record<string, any>): void => {
    try {
        localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences))
    } catch (error) {
        log.warn('Failed to store preferences', { error: (error as Error).message })
    }
}