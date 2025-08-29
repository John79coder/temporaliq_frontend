// ============================================
// src/pages/SignIn.tsx - UPDATED WITHOUT DEMO MODE
// ============================================
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { AppleSignInButton } from '@/components/auth/AppleSignInButton'
import { EmailSignInForm } from '@/components/auth/EmailSignInForm'
import { APP_NAME } from '@/utils/constants'

const SignIn: React.FC = () => {
    const [showEmailForm, setShowEmailForm] = useState(false)
    const navigate = useNavigate()
    const { isAuthenticated } = useAuthStore()

    // Redirect if already authenticated
    React.useEffect(() => {
        if (isAuthenticated) {
            navigate('/')
        }
    }, [isAuthenticated, navigate])

    return (
        <div className="w-full">
            {/* Logo and Title */}
            <div className="text-center mb-8">
                <div className="mx-auto w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-4">
                    <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    Welcome back to {APP_NAME}
                </h1>
                <p className="text-gray-600">
                    Sign in to continue scheduling with AI
                </p>
            </div>

            {!showEmailForm ? (
                <>
                    {/* Apple Sign In */}
                    <div className="space-y-4">
                        <AppleSignInButton />

                        {/* Divider */}
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">Or continue with</span>
                            </div>
                        </div>

                        {/* Email Option */}
                        <button
                            onClick={() => setShowEmailForm(true)}
                            className="w-full flex items-center justify-center px-6 py-3 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            Sign in with Email
                        </button>
                    </div>

                    {/* Sign Up Link */}
                    <p className="mt-8 text-center text-sm text-gray-600">
                        Don't have an account?{' '}
                        <Link to="/signup" className="font-medium text-blue-600 hover:text-blue-700">
                            Sign up for free
                        </Link>
                    </p>
                </>
            ) : (
                <>
                    {/* Back Button */}
                    <button
                        onClick={() => setShowEmailForm(false)}
                        className="mb-6 flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to options
                    </button>

                    {/* Email Sign In Form */}
                    <EmailSignInForm />
                </>
            )}
        </div>
    )
}

export default SignIn
