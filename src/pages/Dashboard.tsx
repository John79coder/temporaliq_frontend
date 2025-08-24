import React from 'react'
import { useAuthStore } from '@/stores/authStore'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/common/Button'

const Dashboard: React.FC = () => {
    const { user } = useAuthStore()
    const navigate = useNavigate()

    return (
        <div className="space-y-8">
            {/* Welcome Header */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    Welcome back, {user?.name || user?.email}!
                </h1>
                <p className="text-gray-600">
                    {user?.isInTrial
                        ? 'You have 14 days left in your trial. Connect Notion to get started!'
                        : 'Ready to schedule your tasks with AI?'}
                </p>

                {user?.isInTrial && (
                    <Button
                        onClick={() => navigate('/onboarding')}
                        className="mt-4"
                    >
                        Complete Setup
                    </Button>
                )}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Tasks Scheduled</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">0</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Hours Saved</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">0</p>
                        </div>
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Integrations</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">0/2</p>
                        </div>
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Empty State */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No tasks scheduled yet</h3>
                <p className="text-gray-600 mb-6">Connect your Notion workspace and calendar to get started</p>
                <Button onClick={() => navigate('/onboarding')}>
                    Get Started
                </Button>
            </div>
        </div>
    )
}

export default Dashboard
