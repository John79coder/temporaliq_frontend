// src/components/auth/TwoFactorSetup.tsx
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { Alert } from '@/components/common/Alert'
import { Copy, Download, Shield, Smartphone, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'
import { useTwoFactorSetup } from '@/hooks/useTwoFactorSetup'


export const TwoFactorSetup: React.FC = () => {
    const navigate = useNavigate()
    const { isAuthenticated, hydrated, isLoading: authLoading } = useAuthStore()
    const [step, setStep] = useState<'intro' | 'setup' | 'verify' | 'backup'>('intro')
    const [verificationCode, setVerificationCode] = useState('')
    const [showSecret, setShowSecret] = useState(false)

    const {
        setupData,
        backupCodes,
        isLoading,
        initializeSetup,
        handleVerifyCode
    } = useTwoFactorSetup()

    useEffect(() => {
        // Start setup when component mounts and user moves to setup step
        if (step === 'setup' && hydrated) {
            void initializeSetup()
        }
    }, [step, hydrated])

    const copyToClipboard = (text: string) => {
        void navigator.clipboard.writeText(text)
        toast.success('Copied to clipboard')
    }

    const downloadBackupCodes = () => {
        const content = `SmartScheduler 2FA Backup Codes
Generated: ${new Date().toLocaleString()}

IMPORTANT: Keep these codes safe! Each code can only be used once.
${backupCodes.map((code, index) => `${index + 1}. ${code}`).join('\n')}

Store these codes in a secure location. You will need them if you lose access to your authenticator app.`

        const blob = new Blob([content], { type: 'text/plain' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `smartscheduler-backup-codes-${Date.now()}.txt`
        a.click()
        URL.revokeObjectURL(url)
    }

    const handleComplete = () => {
        toast.success('2FA setup complete!')
        navigate('/settings/security')
    }

    // Don't render if not authenticated or still loading
    if (!hydrated || authLoading || !isAuthenticated) {
        return (
            <div className="max-w-2xl mx-auto p-6">
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-2xl mx-auto p-6">
            <div className="bg-white rounded-lg shadow-lg">
                {/* Progress Indicator */}
                <div className="border-b border-gray-200 px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <Shield className="w-5 h-5 text-blue-600" />
                            <h1 className="text-xl font-semibold">Two-Factor Authentication Setup</h1>
                        </div>
                        <div className="flex space-x-2">
                            <div className={`h-2 w-16 rounded-full ${step === 'intro' ? 'bg-blue-600' : 'bg-gray-300'}`} />
                            <div className={`h-2 w-16 rounded-full ${step === 'setup' ? 'bg-blue-600' : 'bg-gray-300'}`} />
                            <div className={`h-2 w-16 rounded-full ${step === 'verify' ? 'bg-blue-600' : 'bg-gray-300'}`} />
                            <div className={`h-2 w-16 rounded-full ${step === 'backup' ? 'bg-blue-600' : 'bg-gray-300'}`} />
                        </div>
                    </div>
                </div>

                <div className="p-6">
                    {/* Intro Step */}
                    {step === 'intro' && (
                        <div className="space-y-6">
                            <div className="text-center">
                                <Smartphone className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                                <h2 className="text-2xl font-bold mb-2">Secure Your Account</h2>
                                <p className="text-gray-600">
                                    Two-factor authentication adds an extra layer of security to your account
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-start space-x-3">
                                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                        <span className="text-blue-600 font-semibold text-sm">1</span>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold">Install an authenticator app</h3>
                                        <p className="text-sm text-gray-600">
                                            Such as Google Authenticator, Microsoft Authenticator, or Authy
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-3">
                                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                        <span className="text-blue-600 font-semibold text-sm">2</span>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold">Scan the QR code</h3>
                                        <p className="text-sm text-gray-600">
                                            Use your authenticator app to scan the QR code we'll show you
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-3">
                                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                        <span className="text-blue-600 font-semibold text-sm">3</span>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold">Save backup codes</h3>
                                        <p className="text-sm text-gray-600">
                                            We'll provide backup codes in case you lose access to your app
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <Button
                                onClick={() => setStep('setup')}
                                className="w-full"
                                size="lg"
                            >
                                Get Started
                            </Button>
                        </div>
                    )}

                    {/* Setup Step */}
                    {step === 'setup' && (
                        <div className="space-y-6">
                            {isLoading ? (
                                <div className="flex justify-center py-12">
                                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
                                </div>
                            ) : setupData ? (
                                <>
                                    <div className="text-center">
                                        <h2 className="text-xl font-semibold mb-4">Scan QR Code</h2>
                                        <p className="text-gray-600 mb-6">
                                            Scan this QR code with your authenticator app
                                        </p>

                                        {/* QR Code */}
                                        <div className="inline-block p-4 bg-white border-2 border-gray-200 rounded-lg">
                                            <img
                                                src={setupData.qr_code.startsWith('data:')
                                                    ? setupData.qr_code
                                                    : `data:image/png;base64,${setupData.qr_code}`}
                                                alt="2FA QR Code"
                                                className="w-48 h-48"
                                            />
                                        </div>

                                        {/* Manual Entry Option */}
                                        <div className="mt-6">
                                            <button
                                                onClick={() => setShowSecret(!showSecret)}
                                                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                                            >
                                                Can't scan? Enter code manually
                                            </button>

                                            {showSecret && (
                                                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                                                    <p className="text-sm text-gray-600 mb-2">
                                                        Enter this key in your authenticator app:
                                                    </p>
                                                    <div className="flex items-center justify-center space-x-2">
                                                        <code className="px-3 py-1 bg-white border border-gray-300 rounded font-mono text-sm">
                                                            {setupData.manual_entry_key}
                                                        </code>
                                                        <button
                                                            onClick={() => copyToClipboard(setupData.manual_entry_key)}
                                                            className="p-1 hover:bg-gray-200 rounded"
                                                        >
                                                            <Copy className="w-4 h-4 text-gray-600" />
                                                        </button>
                                                    </div>
                                                    <p className="text-xs text-gray-500 mt-2">
                                                        Account: {setupData.issuer}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <Button
                                        onClick={() => setStep('verify')}
                                        className="w-full"
                                    >
                                        I've Added the Account
                                    </Button>
                                </>
                            ) : null}
                        </div>
                    )}

                    {/* Verify Step */}
                    {step === 'verify' && (
                        <div className="space-y-6">
                            <div className="text-center">
                                <h2 className="text-xl font-semibold mb-4">Verify Setup</h2>
                                <p className="text-gray-600 mb-6">
                                    Enter the 6-digit code from your authenticator app
                                </p>
                            </div>

                            <div className="max-w-xs mx-auto">
                                <Input
                                    type="text"
                                    value={verificationCode}
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/\D/g, '')
                                        if (value.length <= 6) {
                                            setVerificationCode(value)
                                        }
                                    }}
                                    placeholder="000000"
                                    className="text-center text-2xl font-mono tracking-widest"
                                    maxLength={6}
                                />
                            </div>

                            <div className="flex space-x-3">
                                <Button
                                    variant="secondary"
                                    onClick={() => setStep('setup')}
                                    className="flex-1"
                                >
                                    Back
                                </Button>
                                <Button
                                    onClick={() =>
                                        handleVerifyCode(
                                            verificationCode,
                                            setVerificationCode,
                                            setStep
                                        )
                                    }
                                    isLoading={isLoading}
                                    disabled={verificationCode.length !== 6}
                                    className="flex-1"
                                >
                                    Verify
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Backup Codes Step */}
                    {step === 'backup' && backupCodes.length > 0 && (
                        <div className="space-y-6">
                            <div className="text-center">
                                <h2 className="text-xl font-semibold mb-4">Save Your Backup Codes</h2>
                                <Alert variant="warning" className="text-left mb-6">
                                    <AlertTriangle className="w-4 h-4" />
                                    <span>
                                        Save these codes in a secure place. You'll need them to access your account if you lose your authenticator device.
                                    </span>
                                </Alert>
                            </div>

                            <div className="bg-gray-50 rounded-lg p-6">
                                <div className="grid grid-cols-2 gap-3">
                                    {backupCodes.map((code, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center space-x-2 p-2 bg-white rounded border border-gray-200"
                                        >
                                            <span className="text-gray-500 text-sm">{index + 1}.</span>
                                            <code className="font-mono text-sm">{code}</code>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex justify-between">
                                <Button
                                    variant="secondary"
                                    onClick={downloadBackupCodes}
                                    leftIcon={<Download className="w-4 h-4" />}
                                >
                                    Download Codes
                                </Button>
                                <Button
                                    onClick={handleComplete}
                                >
                                    Complete Setup
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}