import * as React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'

const NOTION_AUTH_URL = import.meta.env.VITE_NOTION_AUTH_URL as string
const NOTION_CLIENT_ID = import.meta.env.VITE_NOTION_CLIENT_ID as string
const NOTION_REDIRECT_URI = import.meta.env.VITE_NOTION_REDIRECT_URI as string

function assertEnv(name: string, value: unknown): asserts value is string {
    if (typeof value !== 'string' || !value) {
        throw new Error(`Missing required env: ${name}`)
    }
}

export default function NotionConnectButton() {
    const [loading, setLoading] = React.useState(false)
    const navigate = useNavigate()
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

    const handleConnect = React.useCallback(() => {
        try {
            if (!isAuthenticated) {
                navigate('/signin')
                return
            }

            assertEnv('VITE_NOTION_AUTH_URL', NOTION_AUTH_URL)
            assertEnv('VITE_NOTION_CLIENT_ID', NOTION_CLIENT_ID)
            assertEnv('VITE_NOTION_REDIRECT_URI', NOTION_REDIRECT_URI)

            const state = crypto.randomUUID()
            sessionStorage.setItem('notion_oauth_state', state)
            sessionStorage.setItem('notion_oauth_redirect_uri', NOTION_REDIRECT_URI)

            // Build OAuth URL. We do not hardcode the base host; it comes from env.
            const params = new URLSearchParams({
                client_id: NOTION_CLIENT_ID,
                redirect_uri: NOTION_REDIRECT_URI,
                response_type: 'code',
                owner: 'user', // per docs, user-level install
                state,
            })
            setLoading(true)
            window.location.assign(`${NOTION_AUTH_URL}?${params.toString()}`)
        } catch (e) {
            console.error(e)
            setLoading(false)
            alert('Notion connection is not configured. See .env.local')
        }
    }, [isAuthenticated, navigate])

    return (
        <button
            type="button"
            onClick={handleConnect}
            disabled={loading}
            className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-60"
        >
            {/* Notion logo minimal mark */}
            <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded bg-black text-white">N</span>
            {loading ? 'Connecting…' : 'Connect'}
        </button>
    )
}
