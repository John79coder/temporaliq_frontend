// ============================================
// src/pages/SignUp.tsx - NEW SIGNUP PAGE
// ============================================
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { signUpWithEmail } from '@/api/auth'
import { Input } from '@/components/common/Input'
import { Button } from '@/components/common/Button'
import { validateEmail, getPasswordStrength } from '@/utils/validators'
import { setStoredUser, setStoredToken } from '@/utils/storage'
import { APP_NAME } from '@/utils/constants'
import toast from 'react-hot-toast'

const SignUp: React.FC = () => {
    const navigate = useNavigate()
    const { login } = useAuthStore()

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
    })

    const [errors, setErrors] = useState({
        email: '',
        password: '',
        confirmPassword: '',
    })

    const [isLoading, setIsLoading] = useState(false)
    const [agreedToTerms, setAgreedToTerms] = useState(false)

    const passwordStrength = getPasswordStrength(formData.password)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))

        // Clear error for this field
        setErrors(prev => ({ ...prev, [name]: '' }))

        // Real-time validation
        if (name === 'email' && value && !validateEmail(value)) {
            setErrors(prev => ({ ...prev, email: 'Please enter a valid email' }))
        }

        if (name === 'confirmPassword' && value && value !== formData.password) {
            setErrors(prev => ({ ...prev, confirmPassword: 'Passwords do not match' }))
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Validation
        const newErrors = {
            email: '',
            password: '',
            confirmPassword: '',
        }

        if (!formData.email) {
            newErrors.email = 'Email is required'
        } else if (!validateEmail(formData.email)) {
            newErrors.email = 'Please enter a valid email'
        }

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

        if (!agreedToTerms) {
            toast.error('Please agree to the Terms and Privacy Policy')
            return
        }

        if (newErrors.email || newErrors.password || newErrors.confirmPassword) {
            setErrors(newErrors)
            return
        }

        setIsLoading(true)

        try {
            const response = await signUpWithEmail({
                email: formData.email,
                password: formData.password,
            })

            // Store user and token
            setStoredUser(response.user)
            setStoredToken(response.access_token)
            if (response.refresh_token) {
                localStorage.setItem('refresh_token', response.refresh_token)
            }

            // Update auth store
            login(response.user, response.access_token)

            // Show success message
            toast.success('Account created! Please check your email to verify.')

            // Navigate to verification notice or dashboard
            navigate('/verify-email')
        } catch (error: any) {
            console.error('Sign up error:', error)

            // Handle specific errors
            if (error.message.includes('already exists') || error.message.includes('Email exists')) {
                setErrors({ ...errors, email: 'This email is already registered' })
            } else {
                toast.error(error.message || 'Failed to create account. Please try again.')
            }
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-apple-background px-4">
            <div className="w-full max-w-md">
                {/* Logo and Title */}
                <div className="text-center mb-8">
                    <div className="mx-auto w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-4">
                        <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        Create your {APP_NAME} account
                    </h1>
                    <p className="text-gray-600">
                        Start scheduling smarter in seconds
                    </p>
                </div>

                {/* Sign Up Form */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <Input
                            label="Email"
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="you@example.com"
                            error={errors.email}
                            disabled={isLoading}
                            autoComplete="email"
                            required
                        />

                        <div>
                            <Input
                                label="Password"
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Create a strong password"
                                error={errors.password}
                                disabled={isLoading}
                                showPasswordToggle
                                autoComplete="new-password"
                                required
                            />

                            {/* Password Strength Indicator */}
                            {formData.password && (
                                <div className="mt-2">
                                    <div className="flex items-center justify-between text-xs mb-1">
                                        <span className="text-gray-600">Password strength:</span>
                                        <span className={`font-medium ${passwordStrength.color.replace('bg-', 'text-')}`}>
                      {passwordStrength.label}
                    </span>
                                    </div>
                                    <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                                            style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        <Input
                            label="Confirm Password"
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="Re-enter your password"
                            error={errors.confirmPassword}
                            disabled={isLoading}
                            autoComplete="new-password"
                            required
                        />

                        {/* Terms and Privacy */}
                        <div className="flex items-start">
                            <input
                                id="terms"
                                type="checkbox"
                                checked={agreedToTerms}
                                onChange={(e) => setAgreedToTerms(e.target.checked)}
                                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="terms" className="ml-2 text-sm text-gray-600">
                                I agree to the{' '}
                                <a href="/terms" target="_blank" className="text-blue-600 hover:text-blue-700">
                                    Terms of Service
                                </a>{' '}
                                and{' '}
                                <a href="/privacy" target="_blank" className="text-blue-600 hover:text-blue-700">
                                    Privacy Policy
                                </a>
                            </label>
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            size="lg"
                            isLoading={isLoading}
                            disabled={!agreedToTerms}
                        >
                            Create Account
                        </Button>
                    </form>

                    {/* Sign In Link */}
                    <p className="mt-6 text-center text-sm text-gray-600">
                        Already have an account?{' '}
                        <Link to="/signin" className="font-medium text-blue-600 hover:text-blue-700">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default SignUp
