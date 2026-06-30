import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/common/Button'
import NotionConnectButton from '@/components/integrations/NotionConnectButton'
import { useOnboardingStore } from '@/stores/onboardingStore'

import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getNotionConnection } from '@/api/notion'

const Onboarding: React.FC = () => {
  const navigate = useNavigate()
  const notionConnected = useOnboardingStore((s) => s.notionConnected)

  const setNotionConnected = useOnboardingStore((s) => s.setNotionConnected)
  const setWorkspaceId = useOnboardingStore((s) => s.setWorkspaceId)
  const setConnectedAt = useOnboardingStore((s) => s.setConnectedAt)

  const [searchParams, setSearchParams] = useSearchParams()

  useEffect(() => {
    if (!searchParams.get('notion_connected')) {
      return
    }

    const loadConnection = async () => {
      try {
        const connection = await getNotionConnection()

        if (connection.connected) {
          setNotionConnected(true)
          setWorkspaceId(connection.workspace_id)
          setConnectedAt(connection.connected_at)
        }

        const params = new URLSearchParams(searchParams)
        params.delete('notion_connected')
        setSearchParams(params, { replace: true })
      } catch (e) {
        console.error('Failed to retrieve Notion connection', e)
      }
    }

    loadConnection()
  }, [searchParams, setSearchParams, setNotionConnected, setWorkspaceId, setConnectedAt])

  return (
    <div className="mx-auto max-w-2xl">
      <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="mb-4 text-2xl font-bold text-gray-900">Let's Get You Set Up!</h1>
        <p className="mb-8 text-gray-600">
          Connect your tools to start scheduling with AI. This will only take a few minutes.
        </p>

        <div className="space-y-6">
          <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
            <div className="flex items-center space-x-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                <span className="text-xl">📝</span>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Connect Notion</h3>
                <p className="text-sm text-gray-600">Import tasks from your databases or pages</p>
                {notionConnected && (
                  <div className="mt-1 text-xs font-medium text-emerald-600">Connected</div>
                )}
              </div>
            </div>

            {!notionConnected ? (
              <NotionConnectButton />
            ) : (
              <div className="flex items-center gap-2">
                <Button size="sm" variant="secondary" onClick={() => navigate('/notion/databases')}>
                  Use Notion Database
                </Button>
                <Button size="sm" variant="secondary" onClick={() => navigate('/notion/pages')}>
                  Use Notion Page
                </Button>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
            <div className="flex items-center space-x-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                <span className="text-xl">📅</span>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Connect Calendar</h3>
                <p className="text-sm text-gray-600">Sync with iCloud or Google Calendar</p>
              </div>
            </div>
            <Button size="sm" variant="secondary">
              Connect
            </Button>
          </div>
        </div>

        <div className="mt-8 flex justify-between">
          <Button variant="ghost" onClick={() => navigate('/')}>
            Skip for now
          </Button>
          <Button onClick={() => navigate('/')}>Continue</Button>
        </div>
      </div>
    </div>
  )
}

export default Onboarding
