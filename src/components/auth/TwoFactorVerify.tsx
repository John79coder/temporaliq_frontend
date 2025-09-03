// src/components/auth/TwoFactorVerify.tsx
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { verify2FA } from '@/api/auth'
import { useAuthStore } from '@/stores/authStore'
import { setStoredUser, setStoredToken } from '@/utils/storage'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { Alert } from '@/components/common/Alert'
import { Shield, Smartphone, Key } from 'lucide-react'
import toast from 'react-hot-toast'

export const TwoFactorVerify: React.FC = () => {
    const navigate = useNavigate()
    const { login } = useAuthStore()
    const [code, setCode] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [useBackupCode, setUseBackupCode] = useState(false)
    const [tempToken, setTempToken] = useState<string | null>(null)
    const [userData, setUserData] = useState<any>(null)

    useEffect(() => {
        // Get temporary token and user data from session storage
        const token = sessionStorage.getItem('2fa_temp_token')
        const user = sessionStorage.getItem('2fa_user')

        if (!token || !user) {
            toast.error('Session expired. Please login again.')
            navigate('/signin')
            return
        }

        setTempToken(token)
        setUserData(JSON.parse(user))
    }, [navigate])

    const handleVerify = async () => {
        const codeToVerify = useBackupCode ? code.replace(/[-\s]/g, '') : code

        if (!useBackupCode && codeToVerify.length !== 6) {
            toast.error('Please enter a 6-digit code')
            return
        }

        if (useBackupCode && codeToVerify.length < 8) {
            toast.error('Please enter a valid backup code')
            return
        }

        setIsLoading(true)

        try {
            const response = await verify2FA({
                code: codeToVerify,
                temp_token: tempToken!
            })

            // Clear session storage
            sessionStorage.removeItem('2fa_temp_token')
            sessionStorage.removeItem('2fa_user')

            // Store authentication data
            setStoredUser(response.user)
            setStoredToken(response.jwt)

            // Update auth store
            login({ user: response.user, token: response.jwt })

            toast.success('Successfully authenticated!')

            // Navigate to dashboard or intended destination
            const intendedPath = sessionStorage.getItem('intended_path')
            if (intendedPath) {
                sessionStorage.removeItem('intended_path')
                navigate(intendedPath)
            } else {
                navigate('/dashboard')
            }
        } catch (error: any) {
            console.error('2FA verification failed:', error)

            if (error.response?.status === 401) {
                toast.error('Session expired. Please login again.')
                navigate('/signin')
            } else if (error.response?.status === 400) {
                toast.error('Invalid code. Please try again.')
                setCode('')
            } else {
                toast.error('Verification failed. Please try again.')
            }
        } finally {
            setIsLoading(false)
        }
    }

    const handleCancel = () => {
        // Clear session and go back to login
        sessionStorage.removeItem('2fa_temp_token')
        sessionStorage.removeItem('2fa_user')
        navigate('/signin')
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && (code.length === 6 || (useBackupCode && code.length >= 8))) {
            handleVerify()
        }
    }

    if (!tempToken || !userData) {
        return null
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                        <Shield className="w-8 h-8 text-blue-600" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900">
                        Two-Factor Authentication
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Verifying your identity for {userData?.email}
                    </p>
                </div>

                <div className="bg-white py-8 px-4 shadow-lg rounded-lg sm:px-10">
                    <div className="space-y-6">
                        {!useBackupCode ? (
                            <>
                                <div className="text-center">
                                    <Smartphone className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                    <p className="text-sm text-gray-600">
                                        Enter the 6-digit code from your authenticator app
                                    </p>
                                </div>

                                <div>
                                    <Input
                                        type="text"
                                        value={code}
                                        onChange={(e) => {
                                            const value = e.target.value.replace(/\D/g, '')
                                            if (value.length <= 6) {
                                                setCode(value)
                                            }
                                        }}
                                        onKeyPress={handleKeyPress}
                                        placeholder="000000"
                                        className="text-center text-2xl font-mono tracking-widest"
                                        maxLength={6}
                                        autoComplete="off"
                                        autoFocus
                                        disabled={isLoading}
                                    />
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="text-center">
                                    <Key className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                    <p className="text-sm text-gray-600">
                                        Enter one of your backup codes
                                    </p>
                                </div>

                                <div>
                                    <Input
                                        type="text"
                                        value={code}
                                        onChange={(e) => setCode(e.target.value.toUpperCase())}
                                        onKeyPress={handleKeyPress}
                                        placeholder="XXXX-XXXX"
                                        className="text-center font-mono"
                                        autoComplete="off"
                                        autoFocus
                                        disabled={isLoading}
                                    />
                                </div>
                            </>
                        )}

                        <div className="flex space-x-3">
                            <Button
                                variant="secondary"
                                onClick={handleCancel}
                                disabled={isLoading}
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleVerify}
                                isLoading={isLoading}
                                disabled={!useBackupCode ? code.length !== 6 : code.length < 8}
                                className="flex-1"
                            >
                                Verify
                            </Button>
                        </div>

                        <div className="text-center">
                            <button
                                type="button"
                                onClick={() => {
                                    setUseBackupCode(!useBackupCode)
                                    setCode('')
                                }}
                                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                            >
                                {useBackupCode ? 'Use authenticator app' : "Don't have your phone? Use backup code"}
                            </button>
                        </div>
                    </div>
                </div>

                <Alert variant="info">
                    <div className="text-sm">
                        <strong>Need help?</strong> If you're unable to access your authenticator app or backup codes,
                        please contact support for assistance.
                    </div>
                </Alert>
            </div>
        </div>
    )
}