import * as React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { startNotionOAuth } from '@/api/notion'

export default function NotionConnectButton() {
  const [loading, setLoading] = React.useState(false)
  const navigate = useNavigate()

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const user = useAuthStore((s) => s.user)

  const handleConnect = React.useCallback(async () => {
    try {
      if (!isAuthenticated || !user?.id) {
        navigate('/signin')
        return
      }

      setLoading(true)

      const result = await startNotionOAuth()
      window.location.href = result.authorize_url
    } catch (e) {
      console.error(e)
      setLoading(false)
      alert('Notion connection is not configured. Check your backend configuration.')
    }
  }, [isAuthenticated, navigate, user])

  return (
    <button
      type="button"
      onClick={handleConnect}
      disabled={loading}
      className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-60"
    >
      <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded bg-black text-xs font-bold text-white">
        N
      </span>
      {loading ? 'Connecting…' : 'Connect Notion'}
    </button>
  )
}
