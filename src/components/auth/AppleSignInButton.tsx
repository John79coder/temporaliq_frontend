import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { signInWithApple } from '@/api/auth'
import { setStoredUser } from '@/utils/storage'
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
    const [isAppleReady, setIsAppleReady] = useState(false)

    useEffect(() => {
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
            // Don't show error toast in demo mode
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
                    clientId: import.meta.env.VITE_APPLE_CLIENT_ID || 'com.smartscheduler.web',
                    scope: 'name email',
                    redirectURI: `${window.location.origin}/auth/apple/callback`,
                    usePopup: true,
                })
                setIsAppleReady(true)
            } catch (error) {
                console.error('Failed to initialize Apple Sign In:', error)
            }
        }
    }

    const handleAppleSignIn = async () => {
        // Always use mock in demo mode
        setIsLoading(true)
        try {
            // Mock Apple sign in
            const response = await signInWithApple('mock_apple_auth_code')

            // Store user data
            setStoredUser(response.user)

            // Update auth store
            login(response.user, response.access_token)

            // Show success message
            toast.success(`Welcome, ${response.user.name}!`)

            // Navigate to appropriate page
            navigate('/onboarding')
        } catch (error) {
            console.error('Apple Sign In failed:', error)
            toast.error('Failed to sign in with Apple')
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
