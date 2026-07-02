// src/components/layouts/AppLayout.tsx
import React, { useEffect, useRef } from 'react'
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { logout as apiLogout, getCurrentUser } from '@/api/auth'
import { cn } from '@/utils/cn'
import toast from 'react-hot-toast'

const AppLayout: React.FC = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const { user, setLoading, logout, login } = useAuthStore()

    // Prevent dev-mode double execution of the bootstrap effect
    const initRanRef = useRef(false)

    useEffect(() => {
        if (initRanRef.current) return
        initRanRef.current = true

        const initAuth = async () => {
            setLoading(true)

            try {
                const fetchedUser = await getCurrentUser()

                if (fetchedUser) {
                    login({ user: fetchedUser })
                } else {
                    logout()
                }
            } catch {
                // Not authenticated or session expired
                logout()
            } finally {
                setLoading(false)
            }
        }

        initAuth()
    }, [])

    const handleLogout = async () => {
        try {
            await apiLogout()
        } catch (error) {
            console.error('Logout error:', error)
        } finally {
            logout()
            sessionStorage.clear()
            toast.success('Logged out successfully')
            navigate('/signin')
        }
    }

    const navItems = [
        { path: '/', label: 'Dashboard', icon: '📊' },
        { path: '/settings', label: 'Settings', icon: '⚙️' },
        { path: '/settings/security', label: 'Security', icon: '🔐' },
    ]

    const getUserStatus = () => {
        if (!user) return ''

        const parts = []

        if (user.two_factor_enabled) {
            parts.push('🔐 2FA')
        }

        if (user.isInTrial) {
            parts.push('Trial')
        } else if (user.isSubscribed) {
            parts.push('Pro')
        } else {
            parts.push('Free')
        }

        return parts.join(' • ')
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navigation */}
            <nav className="bg-white shadow-sm border-b border-gray-200">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between">
                        {/* Logo and Nav Items */}
                        <div className="flex items-center space-x-8">
                            <Link to="/" className="flex items-center space-x-2">
                                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <span className="text-xl font-semibold">SmartScheduler</span>
                            </Link>

                            <div className="flex space-x-4">
                                {navItems.map((item) => (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        className={cn(
                                            'px-3 py-2 text-sm font-medium rounded-md transition-colors',
                                            location.pathname === item.path
                                                ? 'bg-blue-50 text-blue-700'
                                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                        )}
                                    >
                                        <span className="mr-1">{item.icon}</span>
                                        {item.label}
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* User Menu */}
                        <div className="flex items-center space-x-4">
                            {user && (
                                <div className="flex items-center space-x-3">
                                    <div className="text-right">
                                        <p className="text-sm font-medium text-gray-900">
                                            {user.name || user.email}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {getUserStatus()}
                                        </p>
                                    </div>
                                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                                        <span className="text-sm font-medium text-gray-600">
                                            {(user.name || user.email).charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                </div>
                            )}

                            <button
                                onClick={handleLogout}
                                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
                <Outlet />
            </main>
        </div>
    )
}

export default AppLayout
