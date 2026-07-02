// src/utils/storage.ts

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
        console.error('Error clearing auth data:', error)
    }
}

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