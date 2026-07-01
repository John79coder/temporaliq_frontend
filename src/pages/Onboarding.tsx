import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/common/Button'
import NotionConnectButton from '@/components/integrations/NotionConnectButton'
import { useOnboardingStore } from '@/stores/onboardingStore'

import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getNotionConnection } from '@/api/notion'
import ICalendarConnectButton from "@components/integrations/iCalendarConnectButton.tsx";

const Onboarding: React.FC = () => {
  const navigate = useNavigate()
  const notionConnected = useOnboardingStore((s) => s.notionConnected)

  const setNotionConnected = useOnboardingStore((s) => s.setNotionConnected)
  const setWorkspaceId = useOnboardingStore((s) => s.setWorkspaceId)
  const setConnectedAt = useOnboardingStore((s) => s.setConnectedAt)

  const [searchParams, setSearchParams] = useSearchParams()

  useEffect(() => {
    const loadConnection = async () => {
      try {
        const connection = await getNotionConnection()

        if (connection.connected) {
          setNotionConnected(true)
          setWorkspaceId(connection.workspace_id)
          setConnectedAt(connection.connected_at)
        }

        // Remove the query parameter if it's present.
        if (searchParams.has('notion_connected')) {
          const params = new URLSearchParams(searchParams)
          params.delete('notion_connected')
          setSearchParams(params, { replace: true })
        }
      } catch (e) {
        console.error('Failed to retrieve Notion connection', e)
      }
    }

    loadConnection()

  }, [searchParams, setSearchParams, setNotionConnected, setWorkspaceId, setConnectedAt])

  const integrationButtonClass =
      "min-w-[140px]"

  return (
    <div className="mx-auto max-w-2xl">
      <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="mb-4 text-2xl font-bold text-gray-900">Let's Get You Set Up!</h1>
        <p className="mb-8 text-gray-600">
          Connect your tools to start scheduling with AI. This will only take a few minutes.
        </p>

        <div className="space-y-6">
          <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
            <div className="flex flex-1 items-center space-x-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                <span className="text-xl">📝</span>
              </div>
              <div className="flex flex-col justify-center">
                <h3 className="font-medium text-gray-900">
                  {notionConnected ? 'Notion' : 'Connect Notion'}
                </h3>
                <p className="text-sm text-gray-600">{
                  notionConnected
                      ? 'Choose what you\'d like to import.'
                      : 'Import tasks from your databases or pages'}
                </p>
                {notionConnected && (
                    <div className="mt-3 flex items-center gap-2 text-xs font-medium tracking-wide text-emerald-600">
                      <span>✓</span>
                      <span>Connected</span>
                    </div>
                )}
              </div>
            </div>

            {!notionConnected ? (
              <NotionConnectButton />
            ) : (
                <div className="ml-6 flex items-center gap-3">
                <Button
                    size="sm"
                    variant="subtle"
                    className={ integrationButtonClass }
                    onClick={() => navigate('/notion/databases')}
                >
                  🗄 Database
                </Button>

                <Button
                    size="sm"
                    variant="subtle"
                    className={ integrationButtonClass }
                    onClick={() => navigate('/notion/pages')}
                >
                  📄 Page
                </Button>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
            <div className="flex flex-1 items-center space-x-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                <span className="text-xl">📅</span>
              </div>
              <div className="flex flex-col justify-center">
                <h3 className="font-medium text-gray-900">Calendar</h3>
                <p className="text-sm text-gray-600">Sync with iCloud or Google Calendar</p>
              </div>
            </div>
            <ICalendarConnectButton/>
          </div>
        </div>

        <div className="mt-8 flex justify-between">
          <Button variant="ghost" className={ integrationButtonClass } onClick={() => navigate('/')}>
            Skip for now
          </Button>
          <Button onClick={() => navigate('/')}>Continue</Button>
        </div>
      </div>
    </div>
  )
}

export default Onboarding
