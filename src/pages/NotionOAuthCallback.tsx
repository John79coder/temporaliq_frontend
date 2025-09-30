import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { connectNotion } from '@/api/notion'
import { useOnboardingStore } from '@/stores/onboardingStore'
import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/common/Button'
import toast from 'react-hot-toast'

/**
 * Restores OAuth state validation (anti-CSRF) and keeps re-auth/auto-resume.
 * Required backend payload: { user_id, code, redirect_uri }.
 */

const PENDING_KEY = 'pending_notion_oauth'
const STATE_KEY = 'notion_oauth_state'
const REDIRECT_KEY = 'notion_oauth_redirect_uri'

const NotionOAuthCallback: React.FC = () => {
    const navigate = useNavigate()
    const [params] = useSearchParams()
    const setNotionConnected = useOnboardingStore((s) => s.setNotionConnected)
    const user = useAuthStore((s) => s.user)

    const [status, setStatus] = useState<'idle' | 'working' | 'error' | 'success'>('idle')
    const [message, setMessage] = useState<string>('')

    useEffect(() => {
        const code = params.get('code')
        const state = params.get('state')

        const storedRedirect = sessionStorage.getItem(REDIRECT_KEY)
        const envRedirect = (import.meta as any).env?.VITE_NOTION_REDIRECT_URI as string | undefined
        const redirectUri = storedRedirect || envRedirect

        // Basic param checks
        if (!code || !state) {
            setStatus('error')
            setMessage('Missing OAuth parameters from Notion.')
            return
        }
        if (!redirectUri) {
            setStatus('error')
            setMessage('Missing Notion redirect URI configuration.')
            return
        }

        // ✅ Restore state validation (anti-CSRF)
        const expectedState = sessionStorage.getItem(STATE_KEY)
        if (!expectedState || state !== expectedState) {
            setStatus('error')
            setMessage('Invalid OAuth state. Please start the Notion connect flow again.')
            // Cleanup the stale state so a fresh attempt works cleanly
            sessionStorage.removeItem(STATE_KEY)
            sessionStorage.removeItem(REDIRECT_KEY)
            return
        }

        const run = async () => {
            setStatus('working')
            setMessage('Finalizing your Notion connection…')

            // If user context isn’t available, persist payload and require sign-in
            if (!user?.id) {
                try {
                    sessionStorage.setItem(PENDING_KEY, JSON.stringify({ code, redirect_uri: redirectUri, ts: Date.now() }))
                } catch { /* best effort */ }
                toast('Please sign in to finish connecting Notion.', { icon: '🔒' })
                navigate('/signin', { replace: true })
                return
            }

            try {
                await connectNotion({ user_id: user.id, code, redirect_uri: redirectUri } as any)
                setNotionConnected(true)
                setStatus('success')
                setMessage('Notion connected successfully.')
                // Cleanup ephemeral items after success
                sessionStorage.removeItem(PENDING_KEY)
                sessionStorage.removeItem(STATE_KEY)
                sessionStorage.removeItem(REDIRECT_KEY)
                navigate('/onboarding', { replace: true })
            } catch (err: any) {
                const http = err?.response?.status
                if (http === 401) {
                    // Persist the payload and prompt re-auth; onboarding will auto-resume
                    try {
                        sessionStorage.setItem(PENDING_KEY, JSON.stringify({ code, redirect_uri: redirectUri, ts: Date.now() }))
                    } catch { /* best effort */ }
                    toast('Session expired. Please sign in to finish connecting Notion.', { icon: '🔒' })
                    navigate('/signin', { replace: true })
                    return
                }

                setStatus('error')
                const apiMsg = err?.response?.data?.detail || err?.message || 'Failed to connect Notion.'
                setMessage(typeof apiMsg === 'string' ? apiMsg : 'Failed to connect Notion.')
            }
        }

        run()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <div className="max-w-lg mx-auto py-16">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <h1 className="text-2xl font-bold mb-2">Notion Connection</h1>

                {status === 'working' && <p className="text-gray-600">Finalizing… Please wait.</p>}
                {(status === 'error' || status === 'success') && (
                    <p className={status === 'error' ? 'text-red-600' : 'text-green-700'}>{message}</p>
                )}

                {(status === 'error' || status === 'success') && (
                    <div className="mt-6">
                        <Link to="/onboarding">
                            <Button>Back to Onboarding</Button>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    )
}

export default NotionOAuthCallback
