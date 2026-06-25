import { useState, useEffect } from 'react'

import toast from "react-hot-toast";
import {setup2FA, verify2FASetup} from "@api/auth.ts";

import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'


interface SetupData {
    qr_code: string
    secret: string
    manual_entry_key: string
    issuer: string
}

export function useTwoFactorSetup() {

    const [setupData, setSetupData] = useState<SetupData | null>(null)
    const [backupCodes, setBackupCodes] = useState<string[]>([])
    const [isLoading, setIsLoading] = useState(false)

    const navigate = useNavigate()

    const {
        isAuthenticated,
        token,
        hydrated,
        isLoading: authLoading,
        user,
        setUser,
    } = useAuthStore()

    useEffect(() => {
        if (!hydrated || authLoading) {
            return
        }

        if (!isAuthenticated || !token) {
            console.warn('[TwoFactorSetup] User not authenticated, redirecting to login')
            toast.error('Please login first to setup 2FA')
            navigate('/signin', { replace: true })
        }
    }, [isAuthenticated, token, navigate, hydrated, authLoading])


    const initializeSetup = async () => {

        // Double-check authentication
        if (!isAuthenticated || !token) {
            console.error('[TwoFactorSetup] Cannot initialize - user not authenticated')
            toast.error('Please login first')
            navigate('/signin', { replace: true })
            return
        }

        setIsLoading(true)
        try {
            const data = await setup2FA()
            setSetupData(data)
        } catch (error: any) {
            console.error('Failed to initialize 2FA setup:', error)

            if (error.response?.status === 401) {
                toast.error('Session expired. Please login again.')
                navigate('/signin', { replace: true })
            } else {
                toast.error('Failed to start 2FA setup. Please try again.')
                navigate('/settings/security')
            }
        } finally {
            setIsLoading(false)
        }
    }

    const handleVerifyCode = async (
        verificationCode: string,
        setVerificationCode: any,
        setStep: any
    ) => {

        if (!isAuthenticated || !token) {
            toast.error('Please login first')
            navigate('/signin', { replace: true })
            return
        }

        if (verificationCode.length !== 6) {
            toast.error('Please enter a 6-digit code')
            return
        }

        setIsLoading(true)
        try {
            const response = await verify2FASetup({
                code: verificationCode,
                secret: setupData?.secret
            })

            if (response.backup_codes) {
                setBackupCodes(response.backup_codes)
                setStep('backup')
                toast.success('2FA enabled successfully!')

                // CRITICAL: Update the user object in the auth store
                if (user) {
                    const updatedUser = {
                        ...user,
                        two_factor_enabled: true
                    }
                    setUser(updatedUser)

                    // Also update in localStorage to persist
                    const authData = localStorage.getItem('auth')
                    if (authData) {
                        try {
                            const parsed = JSON.parse(authData)
                            if (parsed.state) {
                                parsed.state.user = updatedUser
                                localStorage.setItem('auth', JSON.stringify(parsed))
                            }
                        } catch (e) {
                            console.error('Failed to update auth storage:', e)
                        }
                    }
                }
            }
        } catch (error: any) {
            console.error('2FA verification failed:', error)

            if (error.response?.status === 401) {
                toast.error('Session expired. Please login again.')
                navigate('/signin', { replace: true })
            } else if (error.response?.status === 400) {
                toast.error('Invalid code. Please try again.')
                setVerificationCode('')
            } else {
                toast.error('Verification failed. Please try again.')
            }
        } finally {
            setIsLoading(false)
        }
    }

    return {
        setupData,
        backupCodes,
        isLoading,
        initializeSetup,
        handleVerifyCode,
    }
}