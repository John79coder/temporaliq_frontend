const TOKEN_KEY = 'access_token'
const REFRESH_TOKEN_KEY = 'refresh_token'
const USER_KEY = 'user_data'

export const getStoredToken = (): string | null => {
    try {
        return localStorage.getItem(TOKEN_KEY)
    } catch (error) {
        console.error('Error reading token from storage:', error)
        return null
    }
}

export const setStoredToken = (token: string): void => {
    try {
        localStorage.setItem(TOKEN_KEY, token)
    } catch (error) {
        console.error('Error storing token:', error)
    }
}

export const removeStoredToken = (): void => {
    try {
        localStorage.removeItem(TOKEN_KEY)
        localStorage.removeItem(REFRESH_TOKEN_KEY)
        localStorage.removeItem(USER_KEY)
    } catch (error) {
        console.error('Error removing tokens:', error)
    }
}

export const getStoredUser = (): any => {
    try {
        const userStr = localStorage.getItem(USER_KEY)
        return userStr ? JSON.parse(userStr) : null
    } catch (error) {
        console.error('Error reading user from storage:', error)
        return null
    }
}

export const setStoredUser = (user: any): void => {
    try {
        localStorage.setItem(USER_KEY, JSON.stringify(user))
    } catch (error) {
        console.error('Error storing user:', error)
    }
}
