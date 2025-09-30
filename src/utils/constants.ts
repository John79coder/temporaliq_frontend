
export const APP_NAME = 'SmartScheduler'
export const APP_TAGLINE = 'AI-Powered Task Scheduling for Your Calendar'

export const ROUTES = {
    SIGNIN: '/signin',
    SIGNUP: '/signup',
    DASHBOARD: '/',
    ONBOARDING: '/onboarding',
    SETTINGS: '/settings',
    SUCCESS: '/success',
    VERIFY_EMAIL: '/verify-email',
} as const

export const API_ENDPOINTS = {
    AUTH: {
        SIGNIN: '/auth/login',
        SIGNUP: '/auth/signup',
        APPLE: '/auth/apple-signin',
        VERIFY: '/auth/verify',
        RESEND_VERIFICATION: '/auth/resend-verification',
        REQUEST_RESET: '/auth/request-reset',
        RESET_PASSWORD: '/auth/reset-password',
        REFRESH: '/auth/refresh',
        LOGOUT: '/auth/logout',
        CURRENT_USER: '/auth/me',
    },
    NOTION: {
        // Backend-authored routes (evidence: app/notion/routes/api.py)
        CONNECT: '/notion/connect',
        DATABASES: '/notion/databases',
        PREVIEW_MAPPING: '/notion/preview-mapping',
        MAP_SCHEMA: '/notion/map-schema',
        GENERATE_CANDIDATES: '/notion/generate-candidates',
        PAGES_GENERATE_CANDIDATES: '/notion/pages/generate-candidates',
        REFRESH_TOKEN: '/notion/refresh-token',
        // Note: The OAuth "callback" is handled by a FRONTEND route (see NotionOAuthCallback.tsx below),
        // not a backend endpoint.
    },
    CALENDAR: {
        CONNECT: '/icloud/connect',
        LIST: '/icloud/calendars',
        AVAILABLE: '/icloud/available',
        SCHEDULE: '/icloud/schedule',
    },
    SCHEDULING: {
        PREVIEW: '/scheduling/preview',
        CONFIRM: '/scheduling/confirm',
    },
    SUBSCRIPTION: {
        CREATE: '/subscriptions/create',
        WEBHOOK: '/subscriptions/webhook',
    },
} as const

export const ERROR_MESSAGES = {
    GENERIC: 'Something went wrong. Please try again.',
    NETWORK: 'Network error. Please check your connection.',
    UNAUTHORIZED: 'Please sign in to continue.',
    INVALID_CREDENTIALS: 'Invalid email or password.',
    EMAIL_IN_USE: 'This email is already registered.',
    WEAK_PASSWORD: 'Please choose a stronger password.',
    UNVERIFIED: 'Please verify your email before signing in.',
} as const
