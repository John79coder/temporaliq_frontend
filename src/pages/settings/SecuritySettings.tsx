// src/pages/settings/SecuritySettings.tsx
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { getBackupCodesInfo, disable2FA, regenerateBackupCodes } from '@/api/auth'
import { Button } from '@/components/common/Button'
import { Alert } from '@/components/common/Alert'
import { Shield, Smartphone, Key, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'

interface SecurityInfo {
    two_factor_enabled: boolean
    codes_remaining: number
}

export const SecuritySettings: React.FC = () => {
    const navigate = useNavigate()
    const { user, isAuthenticated, token } = useAuthStore()
    const [securityInfo, setSecurityInfo] = useState<SecurityInfo | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [showDisableConfirm, setShowDisableConfirm] = useState(false)
    const [showBackupCodes, setShowBackupCodes] = useState(false)
    const [newBackupCodes, setNewBackupCodes] = useState<string[]>([])

    useEffect(() => {
        // Only load security info if user is authenticated
        if (isAuthenticated && token) {
            loadSecurityInfo()
        } else {
            // Redirect to login if not authenticated
            console.warn('[SecuritySettings] User not authenticated, redirecting to login')
            navigate('/signin', { replace: true })
        }
    }, [isAuthenticated, token, navigate])

    const loadSecurityInfo = async () => {
        // Double-check authentication before making API call
        if (!isAuthenticated || !token) {
            console.error('[SecuritySettings] Cannot load security info - user not authenticated')
            setIsLoading(false)
            return
        }

        try {
            const info = await getBackupCodesInfo()
            setSecurityInfo(info)
        } catch (error: any) {
            console.error('Failed to load security info:', error)

            // Handle 401 specifically
            if (error.response?.status === 401) {
                toast.error('Session expired. Please login again.')
                navigate('/signin', { replace: true })
                return
            }

            // If 2FA is not enabled, the API might return an error
            setSecurityInfo({ two_factor_enabled: false, codes_remaining: 0 })
        } finally {
            setIsLoading(false)
        }
    }

    const handleEnable2FA = () => {
        // Verify authentication before navigating to 2FA setup
        if (!isAuthenticated || !token) {
            toast.error('Please login first')
            navigate('/signin', { replace: true })
            return
        }
        navigate('/settings/security/2fa-setup')
    }

    const handleDisable2FA = async () => {
        if (!isAuthenticated || !token) {
            toast.error('Please login first')
            navigate('/signin', { replace: true })
            return
        }

        setIsLoading(true)
        try {
            await disable2FA()
            toast.success('Two-factor authentication disabled')
            setSecurityInfo({ two_factor_enabled: false, codes_remaining: 0 })
            setShowDisableConfirm(false)
        } catch (error: any) {
            console.error('Failed to disable 2FA:', error)

            if (error.response?.status === 401) {
                toast.error('Session expired. Please login again.')
                navigate('/signin', { replace: true })
                return
            }

            toast.error('Failed to disable 2FA. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    const handleRegenerateBackupCodes = async () => {
        if (!isAuthenticated || !token) {
            toast.error('Please login first')
            navigate('/signin', { replace: true })
            return
        }

        setIsLoading(true)
        try {
            const response = await regenerateBackupCodes()
            setNewBackupCodes(response.backup_codes)
            setShowBackupCodes(true)
            toast.success('Backup codes regenerated successfully')

            // Reload security info
            await loadSecurityInfo()
        } catch (error: any) {
            console.error('Failed to regenerate backup codes:', error)

            if (error.response?.status === 401) {
                toast.error('Session expired. Please login again.')
                navigate('/signin', { replace: true })
                return
            }

            toast.error('Failed to regenerate backup codes. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    const downloadBackupCodes = () => {
        const content = `SmartScheduler 2FA Backup Codes
Generated: ${new Date().toLocaleString()}
User: ${user?.email}

IMPORTANT: Keep these codes safe! Each code can only be used once.

${newBackupCodes.map((code, index) => `${index + 1}. ${code}`).join('\n')}

Store these codes in a secure location. You will need them if you lose access to your authenticator app.`

        const blob = new Blob([content], { type: 'text/plain' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `smartscheduler-backup-codes-${Date.now()}.txt`
        a.click()
        URL.revokeObjectURL(url)
    }

    // Show loading while checking authentication
    if (isLoading) {
        return (
            <div className="max-w-4xl mx-auto">
                <h1 className="text-2xl font-bold text-gray-900 mb-8">Security Settings</h1>
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
                </div>
            </div>
        )
    }

    // Don't render if not authenticated (should have redirected already)
    if (!isAuthenticated || !user) {
        return null
    }

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-8">Security Settings</h1>

            {/* Two-Factor Authentication Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
                <div className="p-6">
                    <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                            <div className="p-3 rounded-lg bg-blue-100 text-blue-600">
                                <Shield className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold mb-1">
                                    Two-Factor Authentication (2FA)
                                </h2>
                                <p className="text-gray-600 text-sm mb-3">
                                    Add an extra layer of security to your account
                                </p>
                                <div className="flex items-center space-x-2">
                                    {securityInfo?.two_factor_enabled ? (
                                        <>
                                            <CheckCircle className="w-5 h-5 text-green-600" />
                                            <span className="text-green-600 font-medium">Enabled</span>
                                        </>
                                    ) : (
                                        <>
                                            <XCircle className="w-5 h-5 text-gray-400" />
                                            <span className="text-gray-500">Not enabled</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div>
                            {securityInfo?.two_factor_enabled ? (
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => setShowDisableConfirm(true)}
                                >
                                    Disable
                                </Button>
                            ) : (
                                <Button
                                    size="sm"
                                    onClick={handleEnable2FA}
                                >
                                    Enable
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Backup Codes Section - Only show if 2FA is enabled */}
            {securityInfo?.two_factor_enabled && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
                    <div className="p-6">
                        <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-4">
                                <div className="p-3 rounded-lg bg-blue-100 text-blue-600">
                                    <Key className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold mb-1">
                                        Backup Codes
                                    </h2>
                                    <p className="text-gray-600 text-sm mb-3">
                                        Use backup codes to access your account if you lose access to your authenticator app.
                                    </p>
                                    {securityInfo.codes_remaining > 0 && (
                                        <p className="text-sm">
                                            <span className="font-medium text-gray-900">
                                                {securityInfo.codes_remaining}
                                            </span>{' '}
                                            backup codes remaining
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div>
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={handleRegenerateBackupCodes}
                                    isLoading={isLoading}
                                >
                                    Regenerate Codes
                                </Button>
                            </div>
                        </div>

                        {securityInfo.codes_remaining === 0 && (
                            <Alert
                                type="warning"
                                className="mt-4"
                            >
                                <AlertTriangle className="w-4 h-4" />
                                <span>
                                    You have no backup codes remaining. Generate new codes to ensure you can access your account.
                                </span>
                            </Alert>
                        )}
                    </div>
                </div>
            )}

            {/* Authentication App Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6">
                    <div className="flex items-start space-x-4">
                        <div className="p-3 rounded-lg bg-green-100 text-green-600">
                            <Smartphone className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-lg font-semibold mb-1">
                                Authenticator App
                            </h2>
                            <p className="text-gray-600 text-sm mb-4">
                                Use an authenticator app like Google Authenticator or Authy to generate verification codes.
                            </p>
                            {securityInfo?.two_factor_enabled ? (
                                <p className="text-sm text-green-600 font-medium">
                                    ✓ Authenticator app configured
                                </p>
                            ) : (
                                <p className="text-sm text-gray-500">
                                    Enable 2FA to set up an authenticator app
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Disable 2FA Confirmation Modal */}
            {showDisableConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-md w-full p-6">
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="p-2 rounded-full bg-red-100">
                                <AlertTriangle className="w-6 h-6 text-red-600" />
                            </div>
                            <h3 className="text-lg font-semibold">Disable Two-Factor Authentication?</h3>
                        </div>
                        <p className="text-gray-600 mb-6">
                            Disabling 2FA will make your account less secure. Are you sure you want to continue?
                        </p>
                        <div className="flex space-x-3">
                            <Button
                                variant="secondary"
                                onClick={() => setShowDisableConfirm(false)}
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="danger"
                                onClick={handleDisable2FA}
                                isLoading={isLoading}
                                className="flex-1"
                            >
                                Disable 2FA
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Backup Codes Display Modal */}
            {showBackupCodes && newBackupCodes.length > 0 && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-lg w-full p-6">
                        <h3 className="text-lg font-semibold mb-4">Your New Backup Codes</h3>
                        <Alert type="warning" className="mb-4">
                            <AlertTriangle className="w-4 h-4" />
                            <span>
                                Save these codes in a secure location. Each code can only be used once.
                            </span>
                        </Alert>
                        <div className="bg-gray-50 rounded p-4 mb-4">
                            <div className="grid grid-cols-2 gap-2">
                                {newBackupCodes.map((code, index) => (
                                    <div key={index} className="font-mono text-sm">
                                        {index + 1}. {code}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="flex space-x-3">
                            <Button
                                variant="secondary"
                                onClick={downloadBackupCodes}
                                className="flex-1"
                            >
                                Download Codes
                            </Button>
                            <Button
                                onClick={() => {
                                    setShowBackupCodes(false)
                                    setNewBackupCodes([])
                                }}
                                className="flex-1"
                            >
                                Done
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}