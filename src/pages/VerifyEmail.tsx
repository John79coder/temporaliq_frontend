// ============================================
// src/pages/VerifyEmail.tsx - NEW EMAIL VERIFICATION PAGE
// ============================================
import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { verifyEmail, resendVerificationEmail } from '@/api/auth'
import { Button } from '@/components/common/Button'
import { useAuthStore } from '@/stores/authStore'
import toast from 'react-hot-toast'

const VerifyEmail: React.FC = () => {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const { user } = useAuthStore()

    const [isVerifying, setIsVerifying] = useState(false)
    const [isResending, setIsResending] = useState(false)
    const [verificationStatus, setVerificationStatus] = useState<'pending' | 'success' | 'error'>('pending')

    const token = searchParams.get('token')

    useEffect(() => {
        if (token) {
            handleVerification(token)
        }
    }, [token])

    const handleVerification = async (verificationToken: string) => {
        setIsVerifying(true)

        try {
            await verifyEmail(verificationToken)
            setVerificationStatus('success')
            toast.success('Email verified successfully!')

            // Redirect to signin after 2 seconds
            setTimeout(() => {
                navigate('/signin')
            }, 2000)
        } catch (error: any) {
            setVerificationStatus('error')
            toast.error(error.message || 'Verification failed')
        } finally {
            setIsVerifying(false)
        }
    }

    const handleResend = async () => {
        if (!user?.email) {
            toast.error('Please sign up first')
            navigate('/signup')
            return
        }

        setIsResending(true)

        try {
            await resendVerificationEmail(user.email)
            toast.success('Verification email sent! Check your inbox.')
        } catch (error: any) {
            toast.error(error.message || 'Failed to resend email')
        } finally {
            setIsResending(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-apple-background px-4">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                    {isVerifying ? (
                        <>
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                            </div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-2">
                                Verifying your email...
                            </h2>
                        </>
                    ) : verificationStatus === 'success' ? (
                        <>
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-2">
                                Email Verified!
                            </h2>
                            <p className="text-gray-600 mb-4">
                                Redirecting you to sign in...
                            </p>
                        </>
                    ) : verificationStatus === 'error' ? (
                        <>
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-2">
                                Verification Failed
                            </h2>
                            <p className="text-gray-600 mb-6">
                                The verification link may be expired or invalid.
                            </p>
                            <Button
                                onClick={handleResend}
                                isLoading={isResending}
                                className="w-full"
                            >
                                Resend Verification Email
                            </Button>
                        </>
                    ) : (
                        <>
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-2">
                                Check Your Email
                            </h2>
                            <p className="text-gray-600 mb-6">
                                We've sent a verification link to your email address. Please check your inbox and click the link to verify your account.
                            </p>
                            <Button
                                onClick={handleResend}
                                isLoading={isResending}
                                variant="secondary"
                                className="w-full"
                            >
                                Resend Verification Email
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

export default VerifyEmail
