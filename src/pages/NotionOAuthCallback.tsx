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
    const returnedState = params.get('state')
    const error = params.get('error')

    // Get redirect URI (from sessionStorage or env)
    const storedRedirect = sessionStorage.getItem(REDIRECT_KEY)
    const envRedirect = (import.meta as any).env?.VITE_NOTION_REDIRECT_URI as string | undefined
    const redirectUri = storedRedirect || envRedirect

    if (error) {
      setStatus('error')
      setMessage(`Notion error: ${error}`)
      return
    }

    if (!code) {
      setStatus('error')
      setMessage('Missing authorization code from Notion.')
      return
    }

    if (!redirectUri) {
      setStatus('error')
      setMessage('Missing Notion redirect URI configuration.')
      return
    }

    const expectedState = sessionStorage.getItem(STATE_KEY)
    if (!expectedState || returnedState !== expectedState) {
      setStatus('error')
      setMessage('Invalid OAuth state. Please try connecting Notion again.')

      sessionStorage.removeItem(STATE_KEY)
      sessionStorage.removeItem(REDIRECT_KEY)
      return
    }

    const run = async () => {
      setStatus('working')
      setMessage('Finalizing your Notion connection…')

      if (!user?.id) {
        try {
          sessionStorage.setItem(
            PENDING_KEY,
            JSON.stringify({
              code,
              redirect_uri: redirectUri,
              ts: Date.now(),
            })
          )
        } catch (_) {}

        toast('Please sign in to finish connecting Notion.', { icon: '🔒' })
        navigate('/signin', { replace: true })
        return
      }

      try {
        await connectNotion({
          user_id: user.id,
          code,
          redirect_uri: redirectUri,
        } as any)

        setNotionConnected(true)
        setStatus('success')
        setMessage('Notion connected successfully!')

        // Cleanup
        sessionStorage.removeItem(PENDING_KEY)
        sessionStorage.removeItem(STATE_KEY)
        sessionStorage.removeItem(REDIRECT_KEY)

        // Small delay so user sees success message
        setTimeout(() => {
          navigate('/onboarding', { replace: true })
        }, 1200)
      } catch (err: any) {
        console.error('Notion connect error:', err)
        const httpStatus = err?.response?.status
        const apiMsg = err?.response?.data?.detail || err?.message || 'Failed to connect Notion.'

        if (httpStatus === 401) {
          try {
            sessionStorage.setItem(
              PENDING_KEY,
              JSON.stringify({
                code,
                redirect_uri: redirectUri,
                ts: Date.now(),
              })
            )
          } catch (_) {}
          toast('Session expired. Please sign in again.', { icon: '🔒' })
          navigate('/signin', { replace: true })
          return
        }

        setStatus('error')
        setMessage(typeof apiMsg === 'string' ? apiMsg : 'Failed to connect Notion.')
      }
    }

    run()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params, user, navigate, setNotionConnected])

  return (
    <div className="mx-auto max-w-lg py-16">
      <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="mb-2 text-2xl font-bold">Notion Connection</h1>

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
