export const APP_NAME = 'TemporalIQ'
export const APP_TAGLINE = 'AI-Powered Task Scheduling for Your Calendar'

export const ROUTES = {
    SIGNIN: '/signin',
    SIGNUP: '/signup',
    DASHBOARD: '/',
    ONBOARDING: '/onboarding',
    SETTINGS: '/settings',
    SUCCESS: '/success',
} as const

export const API_ENDPOINTS = {
    AUTH: {
        SIGNIN: '/auth/signin',
        SIGNUP: '/auth/signup',
        APPLE: '/auth/apple',
        REFRESH: '/auth/refresh',
        LOGOUT: '/auth/logout',
        CURRENT_USER: '/auth/me',
    },
    NOTION: {
        CONNECT: '/notion/connect',
        DATABASES: '/notion/databases',
        SYNC: '/notion/sync',
    },
    CALENDAR: {
        CONNECT: '/calendar/connect',
        LIST: '/calendar/list',
        PREVIEW: '/calendar/preview',
        WRITE: '/calendar/write',
    },
} as const

export const ERROR_MESSAGES = {
    GENERIC: 'Something went wrong. Please try again.',
    NETWORK: 'Network error. Please check your connection.',
    UNAUTHORIZED: 'Please sign in to continue.',
    INVALID_CREDENTIALS: 'Invalid email or password.',
    EMAIL_IN_USE: 'This email is already registered.',
    WEAK_PASSWORD: 'Please choose a stronger password.',
} as const
