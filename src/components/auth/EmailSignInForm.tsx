// src/components/auth/EmailSignInForm.tsx
import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { signInWithEmail } from '@/api/auth'
import { Input } from '@/components/common/Input'
import { Button } from '@/components/common/Button'
import { validateEmail } from '@/utils/validators'
import { setRememberMe } from '@/utils/storage'
import toast from 'react-hot-toast'

export const EmailSignInForm: React.FC = () => {
    const navigate = useNavigate()

    const [formData, setFormData] = useState({
        email: '',
        password: '',
    })

    const [errors, setErrors] = useState({
        email: '',
        password: '',
    })

    const [isLoading, setIsLoading] = useState(false)
    const [rememberMe, setRememberMeState] = useState(false)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
        setErrors(prev => ({ ...prev, [name]: '' }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

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
            const response = await signInWithEmail(formData, rememberMe)

            if (response.requires_2fa) {
                sessionStorage.setItem('2fa_user_id', response.user_id || '')
                sessionStorage.setItem('2fa_user', JSON.stringify(response.user || { email: formData.email }))

                toast('Two-factor code required', {
                    icon: '🔐',
                    duration: 4000,
                })
                navigate('/auth/2fa-verify')
                return
            }

            if (!response.user) {
                setIsLoading(false)
                toast.error('No user received from server')
                return
            }

            setRememberMe(rememberMe)

            toast.success(`Welcome back!`)

            if (!response.user.is_verified) {
                navigate('/verify-email')
            } else if (response.user.isInTrial && !response.user.has_used_free_preview) {
                navigate('/onboarding')
            } else {
                navigate('/')
            }
        } catch (error: any) {
            console.error('Sign in error:', error)

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
                        onChange={(e) => setRememberMeState(e.target.checked)}
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
