import React, { useEffect } from 'react'
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { getCurrentUser } from '@/api/auth'
import { getStoredToken, getStoredUser, setStoredUser } from '@/utils/storage'
import { cn } from '@/utils/cn'
import toast from 'react-hot-toast'

const AppLayout: React.FC = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const { user, setUser, setLoading, logout } = useAuthStore()

    useEffect(() => {
        const initAuth = async () => {
            const token = getStoredToken()

            if (!token) {
                setLoading(false)
                navigate('/signin')
                return
            }

            try {
                // Try to get user from storage first
                const storedUser = getStoredUser()
                if (storedUser) {
                    setUser(storedUser)
                }

                // Then fetch fresh data
                const currentUser = await getCurrentUser()
                setUser(currentUser)
                setStoredUser(currentUser)
            } catch (error) {
                console.error('Failed to fetch user:', error)
                // Don't logout on error in demo mode, just use stored user
                const storedUser = getStoredUser()
                if (storedUser) {
                    setUser(storedUser)
                } else {
                    logout()
                    navigate('/signin')
                }
            } finally {
                setLoading(false)
            }
        }

        initAuth()
    }, [])

    const handleLogout = () => {
        logout()
        toast.success('Logged out successfully')
        navigate('/signin')
    }

    const navItems = [
        { path: '/', label: 'Dashboard', icon: '📊' },
        { path: '/settings', label: 'Settings', icon: '⚙️' },
    ]

    return (
        <div className="min-h-screen bg-apple-background">
            {/* Navigation */}
            <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-xl">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between">
                        <div className="flex items-center space-x-8">
                            <Link to="/" className="flex items-center space-x-2">
                                <div className="w-8 h-8 bg-apple-blue rounded-lg flex items-center justify-center">
                                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <span className="font-semibold text-lg">SmartScheduler</span>
                            </Link>

                            <div className="hidden md:flex items-center space-x-1">
                                {navItems.map((item) => (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        className={cn(
                                            'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                                            location.pathname === item.path
                                                ? 'bg-gray-100 text-gray-900'
                                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                        )}
                                    >
                                        <span className="mr-2">{item.icon}</span>
                                        {item.label}
                                    </Link>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            {user && (
                                <div className="flex items-center space-x-3">
                                    <div className="text-right hidden sm:block">
                                        <p className="text-sm font-medium text-gray-900">{user.name || user.email}</p>
                                        <p className="text-xs text-gray-500">
                                            {user.isInTrial ? 'Trial' : user.isSubscribed ? 'Pro' : 'Free'}
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
