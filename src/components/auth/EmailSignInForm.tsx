import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { signInWithEmail } from '@/api/auth'
import { Input } from '@/components/common/Input'
import { Button } from '@/components/common/Button'
import { validateEmail } from '@/utils/validators'
import { setStoredUser } from '@/utils/storage'
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

    // Validate form on change
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))

        // Clear error for this field
        setErrors(prev => ({ ...prev, [name]: '' }))

        // Real-time validation
        if (name === 'email' && value && !validateEmail(value)) {
            setErrors(prev => ({ ...prev, email: 'Please enter a valid email' }))
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Validation checks
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
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters'
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

            // Update auth store
            login(response.user, response.access_token)

            // Show success message
            toast.success(`Welcome back, ${response.user.name || response.user.email}!`)

            // Navigate to dashboard or onboarding
            if (response.user.isInTrial && !response.user.hasUsedFreePreview) {
                navigate('/onboarding')
            } else {
                navigate('/')
            }
        } catch (error: any) {
            console.error('Sign in error:', error)
            toast.error(error.message || 'Failed to sign in. Please try again.')
            setErrors({ ...errors, password: 'Invalid email or password' })
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
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-600">Remember me</span>
                </label>

                <a href="#" className="text-sm text-blue-600 hover:text-blue-700">
                    Forgot password?
                </a>
            </div>

            <Button
                type="submit"
                className="w-full"
                size="lg"
                isLoading={isLoading}
            >
                Sign In
            </Button>
        </form>
    )
}
