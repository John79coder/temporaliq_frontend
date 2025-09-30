import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/common/Button'
import NotionConnectButton from '@/components/integrations/NotionConnectButton'
import { useOnboardingStore } from '@/stores/onboardingStore'

const Onboarding: React.FC = () => {
    const navigate = useNavigate()
    const notionConnected = useOnboardingStore((s) => s.notionConnected)

    return (
        <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Let's Get You Set Up!</h1>
                <p className="text-gray-600 mb-8">
                    Connect your tools to start scheduling with AI. This will only take a few minutes.
                </p>

                <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
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
                                <Button
                                    size="sm"
                                    variant="secondary"
                                    onClick={() => navigate('/notion/databases')}
                                >
                                    Use Notion Database
                                </Button>
                                <Button
                                    size="sm"
                                    variant="secondary"
                                    onClick={() => navigate('/notion/pages')}
                                >
                                    Use Notion Page
                                </Button>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                <span className="text-xl">📅</span>
                            </div>
                            <div>
                                <h3 className="font-medium text-gray-900">Connect Calendar</h3>
                                <p className="text-sm text-gray-600">Sync with iCloud or Google Calendar</p>
                            </div>
                        </div>
                        <Button size="sm" variant="secondary">Connect</Button>
                    </div>
                </div>

                <div className="mt-8 flex justify-between">
                    <Button variant="ghost" onClick={() => navigate('/')}>
                        Skip for now
                    </Button>
                    <Button onClick={() => navigate('/')}>
                        Continue
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default Onboarding
