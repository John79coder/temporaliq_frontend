// src/utils/authDebug.ts
// Debug helper to check auth storage state

export const debugAuthStorage = () => {
    console.group('🔐 Auth Storage Debug')

    // Check direct storage
    console.log('Direct access_token:', localStorage.getItem('access_token'))
    console.log('Direct refresh_token:', localStorage.getItem('refresh_token'))
    console.log('Direct user_data:', localStorage.getItem('user_data'))

    // Check Zustand persisted auth
    const authStore = localStorage.getItem('auth')
    if (authStore) {
        try {
            const parsed = JSON.parse(authStore)
            console.log('Zustand auth store:', parsed)
            console.log('Zustand token:', parsed?.state?.token || parsed?.token)
            console.log('Zustand user:', parsed?.state?.user || parsed?.user)
        } catch (e) {
            console.error('Failed to parse auth store:', e)
        }
    } else {
        console.log('No Zustand auth store found')
    }

    // Check session storage
    console.log('Session access_token:', sessionStorage.getItem('access_token'))
    console.log('Session user_data:', sessionStorage.getItem('user_data'))

    // Check what getStoredToken returns
    import('./storage').then(module => {
        console.log('getStoredToken() returns:', module.getStoredToken())
        console.log('getStoredUser() returns:', module.getStoredUser())
    })

    console.groupEnd()
}

// Make it available globally in dev mode
if (import.meta.env.DEV) {
    (window as any).debugAuthStorage = debugAuthStorage
}