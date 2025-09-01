// ============================================
// src/pages/ForgotPassword.tsx - REQUEST PASSWORD RESET
// ============================================
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { requestPasswordReset } from '@/api/auth'
import { Input } from '@/components/common/Input'
import { Button } from '@/components/common/Button'
import { validateEmail } from '@/utils/validators'
import { APP_NAME } from '@/utils/constants'
import toast from 'react-hot-toast'

const ForgotPassword: React.FC = () => {
    const navigate = useNavigate()
    const [email, setEmail] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [isSubmitted, setIsSubmitted] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        // Validate email
        if (!email) {
            setError('Email is required')
            return
        }

        if (!validateEmail(email)) {
            setError('Please enter a valid email address')
            return
        }

        setIsLoading(true)

        try {
            await requestPasswordReset(email)
            setIsSubmitted(true)
            toast.success('Password reset email sent!')
        } catch (error: any) {
            console.error('Password reset request failed:', error)
            // Don't reveal if email exists or not
            setIsSubmitted(true)
        } finally {
            setIsLoading(false)
        }
    }

    if (isSubmitted) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-apple-background px-4">
                <div className="w-full max-w-md">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                        {/* Success Icon */}
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>

                        <h2 className="text-xl font-semibold text-gray-900 mb-2">
                            Check Your Email
                        </h2>

                        <p className="text-gray-600 mb-6">
                            If an account exists with <span className="font-medium">{email}</span>,
                            we've sent password reset instructions to that email address.
                        </p>

                        <p className="text-sm text-gray-500 mb-6">
                            Didn't receive an email? Check your spam folder or try again with a different email address.
                        </p>

                        <div className="space-y-3">
                            <Button
                                onClick={() => {
                                    setIsSubmitted(false)
                                    setEmail('')
                                }}
                                variant="secondary"
                                className="w-full"
                            >
                                Try Another Email
                            </Button>

                            <Link to="/signin" className="block">
                                <Button variant="primary" className="w-full">
                                    Back to Sign In
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-apple-background px-4">
            <div className="w-full max-w-md">
                {/* Logo and Title */}
                <div className="text-center mb-8">
                    <div className="mx-auto w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-4">
                        <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        Forgot your password?
                    </h1>
                    <p className="text-gray-600">
                        No worries, we'll send you reset instructions
                    </p>
                </div>

                {/* Reset Form */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <Input
                            label="Email"
                            type="email"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value)
                                setError('')
                            }}
                            placeholder="Enter your email"
                            error={error}
                            disabled={isLoading}
                            autoComplete="email"
                            autoFocus
                            required
                        />

                        <Button
                            type="submit"
                            className="w-full"
                            size="lg"
                            isLoading={isLoading}
                        >
                            Send Reset Link
                        </Button>

                        <div className="text-center pt-2">
                            <Link
                                to="/signin"
                                className="text-sm text-gray-600 hover:text-gray-900 inline-flex items-center"
                            >
                                <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                                Back to sign in
                            </Link>
                        </div>
                    </form>
                </div>

                {/* Help Text */}
                <p className="text-center text-xs text-gray-500 mt-6">
                    Remember your password?{' '}
                    <Link to="/signin" className="font-medium text-blue-600 hover:text-blue-700">
                        Sign in instead
                    </Link>
                </p>
            </div>
        </div>
    )
}

// Ensure default export
export default ForgotPassword