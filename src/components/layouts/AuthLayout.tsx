// ============================================
// src/components/layouts/AuthLayout.tsx - FIXED VERSION
// ============================================
import React from 'react'
import { Outlet } from 'react-router-dom'
import { APP_NAME, APP_TAGLINE } from '@/utils/constants'

const AuthLayout: React.FC = () => {
    return (
        <div className="flex min-h-screen">
            {/* Left Panel - Branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-12 flex-col justify-between">
                <div>
                    <div className="flex items-center space-x-2">
                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur">
                            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <span className="text-white text-xl font-semibold">{APP_NAME}</span>
                    </div>
                </div>

                <div className="space-y-6">
                    <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight">
                        {APP_TAGLINE}
                    </h1>
                    <p className="text-white/80 text-lg">
                        Connect your Notion workspace and iCloud calendar. Let AI handle the scheduling.
                    </p>

                    {/* Feature list */}
                    <div className="space-y-4 pt-8">
                        {[
                            'Syncs with Notion databases',
                            'Integrates with iCloud Calendar',
                            'AI-powered scheduling',
                            'Respects your preferences',
                        ].map((feature, index) => (
                            <div key={index} className="flex items-center space-x-3">
                                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <span className="text-white/90">{feature}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="text-white/60 text-sm">
                    © 2025 {APP_NAME}. Built with ❤️ for productivity enthusiasts.
                </div>
            </div>

            {/* Right Panel - Auth Form */}
            <div className="flex-1 flex items-center justify-center p-8 bg-apple-background">
                <div className="w-full max-w-md">
                    <Outlet />
                </div>
            </div>
        </div>
    )
}

export default AuthLayout
