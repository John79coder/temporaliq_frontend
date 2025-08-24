import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from '@/stores/authStore'

// Pages
import SignIn from '@/pages/SignIn'
import Onboarding from '@/pages/Onboarding'
import Dashboard from '@/pages/Dashboard'
import Settings from '@/pages/Settings'
import Success from '@/pages/Success'

// Layouts
import AppLayout from '@/components/layouts/AppLayout'
import AuthLayout from '@/components/layouts/AuthLayout'

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 1,
            refetchOnWindowFocus: false,
        },
    },
})

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isAuthenticated, isLoading } = useAuthStore()

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-apple-blue border-t-transparent" />
            </div>
        )
    }

    if (!isAuthenticated) {
        return <Navigate to="/signin" replace />
    }

    return <>{children}</>
}

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <Routes>
                    {/* Auth Routes */}
                    <Route element={<AuthLayout />}>
                        <Route path="/signin" element={<SignIn />} />
                    </Route>

                    {/* Protected Routes */}
                    <Route element={<AppLayout />}>
                        <Route
                            path="/"
                            element={
                                <ProtectedRoute>
                                    <Dashboard />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/onboarding"
                            element={
                                <ProtectedRoute>
                                    <Onboarding />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/settings"
                            element={
                                <ProtectedRoute>
                                    <Settings />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/success"
                            element={
                                <ProtectedRoute>
                                    <Success />
                                </ProtectedRoute>
                            }
                        />
                    </Route>
                </Routes>
            </BrowserRouter>
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 4000,
                    style: {
                        background: '#1D1D1F',
                        color: '#fff',
                    },
                }}
            />
        </QueryClientProvider>
    )
}

export default App