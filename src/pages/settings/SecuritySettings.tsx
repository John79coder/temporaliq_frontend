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
    const { user } = useAuthStore()
    const [securityInfo, setSecurityInfo] = useState<SecurityInfo | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [showDisableConfirm, setShowDisableConfirm] = useState(false)
    const [showBackupCodes, setShowBackupCodes] = useState(false)
    const [newBackupCodes, setNewBackupCodes] = useState<string[]>([])

    useEffect(() => {
        loadSecurityInfo()
    }, [])

    const loadSecurityInfo = async () => {
        try {
            const info = await getBackupCodesInfo()
            setSecurityInfo(info)
        } catch (error) {
            console.error('Failed to load security info:', error)
            // If 2FA is not enabled, the API might return an error
            setSecurityInfo({ two_factor_enabled: false, codes_remaining: 0 })
        } finally {
            setIsLoading(false)
        }
    }

    const handleEnable2FA = () => {
        navigate('/settings/security/2fa-setup')
    }

    const handleDisable2FA = async () => {
        setIsLoading(true)
        try {
            await disable2FA()
            toast.success('Two-factor authentication disabled')
            setSecurityInfo({ two_factor_enabled: false, codes_remaining: 0 })
            setShowDisableConfirm(false)
        } catch (error) {
            console.error('Failed to disable 2FA:', error)
            toast.error('Failed to disable 2FA. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    const handleRegenerateBackupCodes = async () => {
        setIsLoading(true)
        try {
            const response = await regenerateBackupCodes()
            setNewBackupCodes(response.backup_codes)
            setShowBackupCodes(true)
            toast.success('Backup codes regenerated successfully')

            // Reload security info
            await loadSecurityInfo()
        } catch (error) {
            console.error('Failed to regenerate backup codes:', error)
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

Store these codes in a secure location.`

        const blob = new Blob([content], { type: 'text/plain' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'smartscheduler-backup-codes.txt'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)

        toast.success('Backup codes downloaded')
    }

    if (isLoading) {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
                    <div className="space-y-4">
                        <div className="h-24 bg-gray-200 rounded"></div>
                        <div className="h-24 bg-gray-200 rounded"></div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6">Security Settings</h1>

            {/* Two-Factor Authentication Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
                <div className="p-6">
                    <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                            <div className={`p-3 rounded-lg ${
                                securityInfo?.two_factor_enabled
                                    ? 'bg-green-100 text-green-600'
                                    : 'bg-gray-100 text-gray-600'
                            }`}>
                                <Shield className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold mb-1">
                                    Two-Factor Authentication
                                </h2>
                                <p className="text-gray-600 text-sm mb-3">
                                    Add an extra layer of security to your account by requiring a verification code in addition to your password.
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
                                    <div className="flex items-center space-x-4">
                                        <span className="text-sm">
                                            <strong>{securityInfo.codes_remaining}</strong> codes remaining
                                        </span>
                                        {securityInfo.codes_remaining < 3 && (
                                            <span className="text-sm text-amber-600 flex items-center">
                                                <AlertTriangle className="w-4 h-4 mr-1" />
                                                Running low
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div>
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={handleRegenerateBackupCodes}
                                    disabled={isLoading}
                                >
                                    Regenerate
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Password Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6">
                    <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                            <div className="p-3 rounded-lg bg-gray-100 text-gray-600">
                                <Key className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold mb-1">
                                    Password
                                </h2>
                                <p className="text-gray-600 text-sm mb-3">
                                    Change your account password regularly to maintain security.
                                </p>
                                <p className="text-sm text-gray-500">
                                    Last changed: {user?.updated_at ? new Date(user.updated_at).toLocaleDateString() : 'Never'}
                                </p>
                            </div>
                        </div>
                        <div>
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => navigate('/settings/security/change-password')}
                            >
                                Change Password
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Disable 2FA Confirmation Modal */}
            {showDisableConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <h3 className="text-lg font-semibold mb-3">Disable Two-Factor Authentication?</h3>
                        <p className="text-gray-600 mb-6">
                            Disabling 2FA will make your account less secure. You'll only need your password to sign in.
                        </p>
                        <Alert variant="warning" className="mb-6">
                            <AlertTriangle className="h-4 w-4" />
                            <div>
                                Your backup codes will be deleted and you'll need to set up 2FA again if you want to re-enable it.
                            </div>
                        </Alert>
                        <div className="flex space-x-3">
                            <Button
                                variant="secondary"
                                onClick={() => setShowDisableConfirm(false)}
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
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
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-lg w-full">
                        <h3 className="text-lg font-semibold mb-3">New Backup Codes</h3>
                        <Alert variant="warning" className="mb-4">
                            <AlertTriangle className="h-4 w-4" />
                            <div>
                                Save these codes immediately. You won't be able to see them again.
                            </div>
                        </Alert>
                        <div className="bg-gray-50 rounded-lg p-4 mb-4">
                            <div className="grid grid-cols-2 gap-3">
                                {newBackupCodes.map((code, index) => (
                                    <code key={index} className="text-sm font-mono bg-white px-3 py-2 rounded border border-gray-200">
                                        {code}
                                    </code>
                                ))}
                            </div>
                        </div>
                        <div className="flex space-x-3">
                            <Button
                                variant="secondary"
                                onClick={downloadBackupCodes}
                                className="flex-1"
                            >
                                Download
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