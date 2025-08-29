// ============================================
// src/components/auth/EmailSignInForm.tsx - UPDATED FOR BACKEND
// ============================================
import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { signInWithEmail } from '@/api/auth'
import { Input } from '@/components/common/Input'
import { Button } from '@/components/common/Button'
import { validateEmail } from '@/utils/validators'
import { setStoredUser, setStoredToken, setRefreshToken } from '@/utils/storage'
import toast from 'react-hot-toast'

export const EmailSignInForm: React.FC = () => {
    const navigate = useNavigate()
    const { login } = useAuthStore()

    const [formData, setFormData] = useState({
        email: '',
        password: '',
    })

    const [errors, setErrors] = useState({
        email: '',
        password: '',
    })

    const [isLoading, setIsLoading] = useState(false)
    const [rememberMe, setRememberMe] = useState(false)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))

        // Clear error for this field
        setErrors(prev => ({ ...prev, [name]: '' }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Validation
        const newErrors = {
            email: '',
            password: '',
        }

        if (!formData.email) {
            newErrors.email = 'Email is required'
        } else if (!validateEmail(formData.email)) {
            newErrors.email = 'Please enter a valid email'
        }

        if (!formData.password) {
            newErrors.password = 'Password is required'
        }

        if (newErrors.email || newErrors.password) {
            setErrors(newErrors)
            return
        }

        setIsLoading(true)

        try {
            const response = await signInWithEmail(formData)

            // Store user data
            setStoredUser(response.user)
            setStoredToken(response.access_token)
            if (response.refresh_token) {
                setRefreshToken(response.refresh_token)
            }

            // Update auth store
            login(response.user, response.access_token)

            // Handle remember me
            if (!rememberMe) {
                // Set session storage flag to clear on browser close
                sessionStorage.setItem('temp_session', 'true')
            }

            // Show success message
            toast.success(`Welcome back!`)

            // Navigate based on user status
            if (!response.user.is_verified) {
                navigate('/verify-email')
            } else if (response.user.is_in_trial && !response.user.has_used_free_preview) {
                navigate('/onboarding')
            } else {
                navigate('/')
            }
        } catch (error: any) {
            console.error('Sign in error:', error)

            // Handle specific error cases
            if (error.message.includes('not verified')) {
                setErrors({ ...errors, password: 'Please verify your email first' })
                toast.error('Please check your email for verification link')
            } else if (error.message.includes('Invalid')) {
                setErrors({ ...errors, password: 'Invalid email or password' })
            } else {
                toast.error(error.message || 'Failed to sign in. Please try again.')
            }
        } finally {
            setIsLoading(false)
        }
    }

    return (
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

            <Input
                label="Password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                error={errors.password}
                disabled={isLoading}
                showPasswordToggle
                autoComplete="current-password"
                required
            />

            <div className="flex items-center justify-between">
                <label className="flex items-center">
                    <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-600">Remember me</span>
                </label>

                <Link to="/forgot-password" className="text-sm text-blue-600 hover:text-blue-700">
                    Forgot password?
                </Link>
            </div>

            <Button
                type="submit"
                className="w-full"
                size="lg"
                isLoading={isLoading}
            >
                Sign In
            </Button>

            <p className="text-center text-sm text-gray-600">
                Don't have an account?{' '}
                <Link to="/signup" className="font-medium text-blue-600 hover:text-blue-700">
                    Sign up
                </Link>
            </p>
        </form>
    )
}
