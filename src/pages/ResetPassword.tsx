// ============================================
// src/pages/ResetPassword.tsx - RESET PASSWORD WITH TOKEN
// ============================================
import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { resetPassword } from '@/api/auth'
import { Input } from '@/components/common/Input'
import { Button } from '@/components/common/Button'
//import { getPasswordStrength } from '@/utils/validators'
import toast from 'react-hot-toast'

const ResetPassword: React.FC = () => {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()

    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: ''
    })
    const [errors, setErrors] = useState({
        password: '',
        confirmPassword: '',
        token: ''
    })
    const [isLoading, setIsLoading] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)
    const [passwordStrength, setPasswordStrength] = useState({ score: 0, feedback: '' })

    const token = searchParams.get('token')

    useEffect(() => {
        if (!token) {
            setErrors({ ...errors, token: 'Invalid or missing reset token' })
        }
    }, [token])

    useEffect(() => {
        if (formData.password) {
            //const strength = getPasswordStrength(formData.password)
            //setPasswordStrength(strength)
        } else {
            setPasswordStrength({ score: 0, feedback: '' })
        }
    }, [formData.password])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
        setErrors(prev => ({ ...prev, [name]: '' }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!token) {
            toast.error('Invalid reset link')
            return
        }

        // Validate
        const newErrors = { password: '', confirmPassword: '', token: '' }

        if (!formData.password) {
            newErrors.password = 'Password is required'
        } else if (passwordStrength.score < 2) {
            newErrors.password = 'Password is too weak'
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password'
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match'
        }

        if (newErrors.password || newErrors.confirmPassword) {
            setErrors(newErrors)
            return
        }

        setIsLoading(true)

        try {
            const response = await resetPassword(token, formData.password)

            if (!response.user) {
                toast.error('No user returned from password reset')
                return
            }

            setIsSuccess(true)
            toast.success('Password reset successful!')

            // Redirect to dashboard after 2 seconds
            setTimeout(() => {
                navigate('/')
            }, 2000)
        } catch (error: any) {
            console.error('Password reset failed:', error)

            if (error.message.includes('expired') || error.message.includes('invalid')) {
                setErrors({ ...errors, token: 'This reset link has expired or is invalid' })
            } else {
                toast.error(error.message || 'Failed to reset password')
            }
        } finally {
            setIsLoading(false)
        }
    }

    if (isSuccess) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-apple-background px-4">
                <div className="w-full max-w-md">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>

                        <h2 className="text-xl font-semibold text-gray-900 mb-2">
                            Password Reset Successful!
                        </h2>

                        <p className="text-gray-600 mb-4">
                            Your password has been reset. Redirecting you to the dashboard...
                        </p>

                        <Button onClick={() => navigate('/')} className="w-full">
                            Go to Dashboard
                        </Button>
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
                        Set new password
                    </h1>
                    <p className="text-gray-600">
                        Your new password must be different from previous ones
                    </p>
                </div>

                {/* Reset Form */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    {errors.token ? (
                        <div className="space-y-4">
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                <p className="text-sm text-red-600">{errors.token}</p>
                            </div>
                            <Link to="/forgot-password">
                                <Button className="w-full" variant="primary">
                                    Request New Reset Link
                                </Button>
                            </Link>
                            <Link to="/signin">
                                <Button className="w-full" variant="secondary">
                                    Back to Sign In
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <Input
                                    label="New Password"
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Enter new password"
                                    error={errors.password}
                                    disabled={isLoading}
                                    showPasswordToggle
                                    autoComplete="new-password"
                                    required
                                />

                                {/* Password Strength Indicator */}
                                {formData.password && (
                                    <div className="mt-2">
                                        <div className="flex gap-1 mb-1">
                                            {[...Array(4)].map((_, i) => (
                                                <div
                                                    key={i}
                                                    className={`h-1 flex-1 rounded-full transition-colors ${
                                                        i < passwordStrength.score
                                                            ? passwordStrength.score <= 1
                                                                ? 'bg-red-500'
                                                                : passwordStrength.score === 2
                                                                    ? 'bg-yellow-500'
                                                                    : 'bg-green-500'
                                                            : 'bg-gray-200'
                                                    }`}
                                                />
                                            ))}
                                        </div>
                                        {passwordStrength.feedback && (
                                            <p className="text-xs text-gray-600">
                                                {passwordStrength.feedback}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>

                            <Input
                                label="Confirm New Password"
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="Confirm new password"
                                error={errors.confirmPassword}
                                disabled={isLoading}
                                showPasswordToggle
                                autoComplete="new-password"
                                required
                            />

                            <Button
                                type="submit"
                                className="w-full"
                                size="lg"
                                isLoading={isLoading}
                            >
                                Reset Password
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
                    )}
                </div>
            </div>
        </div>
    )
}

export default ResetPassword