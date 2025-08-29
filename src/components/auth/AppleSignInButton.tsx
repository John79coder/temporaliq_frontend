// ============================================
// src/components/auth/AppleSignInButton.tsx - PRODUCTION VERSION
// ============================================
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { signInWithApple } from '@/api/auth'
import { setStoredUser, setStoredToken, setRefreshToken } from '@/utils/storage'
import toast from 'react-hot-toast'

declare global {
    interface Window {
        AppleID?: {
            auth: {
                init: (config: any) => void
                signIn: () => Promise<any>
            }
        }
    }
}

export const AppleSignInButton: React.FC = () => {
    const navigate = useNavigate()
    const { login } = useAuthStore()
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        // Only load Apple SDK if we have a client ID configured
        const appleClientId = import.meta.env.VITE_APPLE_CLIENT_ID
        if (!appleClientId || appleClientId === 'com.smartscheduler.web') {
            // Skip loading if no real Apple ID configured
            return
        }

        // Check if Apple Sign In SDK is already loaded
        if (window.AppleID) {
            initializeAppleSignIn()
            return
        }

        // Load Apple Sign In SDK
        const script = document.createElement('script')
        script.src = 'https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js'
        script.async = true

        script.onload = () => {
            initializeAppleSignIn()
        }

        script.onerror = () => {
            console.error('Failed to load Apple Sign In SDK')
        }

        document.body.appendChild(script)

        return () => {
            if (script.parentNode) {
                document.body.removeChild(script)
            }
        }
    }, [])

    const initializeAppleSignIn = () => {
        if (window.AppleID) {
            try {
                window.AppleID.auth.init({
                    clientId: import.meta.env.VITE_APPLE_CLIENT_ID,
                    scope: 'name email',
                    redirectURI: `${window.location.origin}/auth/apple/callback`,
                    usePopup: true,
                })
            } catch (error) {
                console.error('Failed to initialize Apple Sign In:', error)
            }
        }
    }

    const handleAppleSignIn = async () => {
        const appleClientId = import.meta.env.VITE_APPLE_CLIENT_ID

        // Check if Apple Sign In is properly configured
        if (!appleClientId || appleClientId === 'com.smartscheduler.web') {
            toast.error('Apple Sign In is not configured. Please use email sign in.')
            return
        }

        if (!window.AppleID) {
            toast.error('Apple Sign In is not available. Please try again or use email sign in.')
            return
        }

        setIsLoading(true)

        try {
            // Trigger Apple Sign In
            const response = await window.AppleID.auth.signIn()

            // Send authorization code and ID token to backend
            const authResponse = await signInWithApple(
                response.authorization.code,
                response.authorization.id_token
            )

            // Store user data and tokens
            setStoredUser(authResponse.user)
            setStoredToken(authResponse.access_token)
            if (authResponse.refresh_token) {
                setRefreshToken(authResponse.refresh_token)
            }

            // Update auth store
            login(authResponse.user, authResponse.access_token)

            // Show success message
            toast.success(`Welcome${authResponse.user.name ? ', ' + authResponse.user.name : ''}!`)

            // Navigate based on user status
            if (!authResponse.user.is_verified) {
                navigate('/verify-email')
            } else if (authResponse.user.is_in_trial && !authResponse.user.has_used_free_preview) {
                navigate('/onboarding')
            } else {
                navigate('/')
            }
        } catch (error: any) {
            console.error('Apple Sign In failed:', error)

            if (error.error === 'popup_closed_by_user') {
                // User cancelled - no need to show error
                return
            }

            toast.error('Failed to sign in with Apple. Please try email sign in.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <button
            onClick={handleAppleSignIn}
            disabled={isLoading}
            className="relative flex h-[52px] w-full items-center justify-center rounded-lg bg-black text-white transition-colors hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {isLoading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
                <>
                    <svg className="absolute left-4 h-6 w-6" viewBox="0 0 24 24">
                        <path
                            fill="currentColor"
                            d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.53 4.09l-.05-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"
                        />
                    </svg>
                    <span className="text-[19px] font-medium">Sign in with Apple</span>
                </>
            )}
        </button>
    )
}
