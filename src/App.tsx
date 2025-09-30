// src/App.tsx

import { debugLogger } from '@/api/debugHelpers';
import { csrfManager } from '@/api/csrf';

import React, { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from '@/stores/authStore'

// Import Layouts
import AuthLayout from '@/components/layouts/AuthLayout'
import AppLayout from '@/components/layouts/AppLayout'

// Import Pages
import SignIn from '@/pages/SignIn'
import SignUp from '@/pages/SignUp'
import ForgotPassword from '@/pages/ForgotPassword'
import ResetPassword from '@/pages/ResetPassword'
import VerifyEmail from '@/pages/VerifyEmail'
import Dashboard from '@/pages/Dashboard'
import Onboarding from '@/pages/Onboarding'
import Settings from '@/pages/Settings'
import Success from '@/pages/Success'

// Import new 2FA and Security components
import { SecuritySettings } from '@/pages/settings/SecuritySettings'
import { TwoFactorSetup } from '@/components/auth/TwoFactorSetup'
import { TwoFactorVerify } from '@/components/auth/TwoFactorVerify'

//
import NotionOAuthCallback from '@/pages/NotionOAuthCallback'

//
import NotionDatabasePicker from '@/pages/NotionDatabasePicker'
import NotionMappingPreview from '@/pages/NotionMappingPreview'
import NotionTaskCandidates from '@/pages/NotionTaskCandidates'

//
import NotionPagePicker from '@/pages/NotionPagePicker'
import NotionPageCandidates from '@/pages/NotionPageCandidates'

//
import SchedulePreview from '@/pages/SchedulePreview'


// Wait until the auth store (Zustand + persist) finishes hydrating
function useAuthHydrated() {
    // NOTE: this relies on Zustand persists runtime API
    const store = useAuthStore as any;

    // If the store isn't persisted, we're "ready" immediately
    const [ready, setReady] = React.useState<boolean>(() => !('persist' in store));

    React.useEffect(() => {
        if (!('persist' in store)) {
            setReady(true);
            return;
        }

        // If already hydrated, mark ready, otherwise subscribe & trigger rehydrate.
        if (store.persist?.hasHydrated?.()) {
            setReady(true);
            return;
        }

        const unsub = store.persist.onFinishHydration(() => setReady(true));
        store.persist.rehydrate?.();

        return () => {
            // Zustand returns a cleanup fn from onFinishHydration in recent versions
            try { unsub && unsub(); } catch {}
        };
    }, []);

    return ready;
}


const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 1,
            refetchOnWindowFocus: false,
            staleTime: 5 * 60 * 1000,
        },
    },
})




// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isAuthenticated, isLoading, user } = useAuthStore()

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
            </div>
        )
    }

    if (!isAuthenticated) {
        return <Navigate to="/signin" replace />
    }

    // Example: gate users who must verify email first
    if (user && user.is_verified === false) {
        return <Navigate to="/verify-email" replace />
    }

    return <>{children}</>
}

function App() {
    const authReady = useAuthHydrated();

    const [appReady, setAppReady] = useState(false)

    useEffect(() => {
        console.log('[App] Initializing application');
        console.log('[App] Environment:', import.meta.env.MODE);
        console.log('[App] API URL:', import.meta.env.VITE_API_URL || 'http://localhost:8000');
        console.log('[App] Initial cookies:', document.cookie);

        // Check for existing session
        const existingToken = localStorage.getItem('access_token');
        console.log('[App] Existing auth token:', existingToken ? 'present' : 'none');

        // Don't pre-fetch CSRF - let interceptor handle it on first request
        setAppReady(true);

        // === New Debug Logging System ===
        console.log('🚀 Initializing debug logging');
        debugLogger.testCookiePersistence();

        (window as any).debugCommands = {
            testCookies: () => debugLogger.testCookiePersistence(),
            showLogs: () => console.table(debugLogger.exportLogs().logs),
            clearLogs: () => debugLogger.clearLogs(),
            getCookies: () => document.cookie,
            getCSRFInfo: () => csrfManager.getDebugInfo(),
        };

        console.log('📋 Debug commands available:');
        console.log('  window.debugCommands.testCookies()');
        console.log('  window.debugCommands.showLogs()');
        console.log('  window.debugCommands.clearLogs()');
        console.log('  window.debugCommands.getCookies()');
        console.log('  window.debugCommands.getCSRFInfo()');
    }, []);


    if (!appReady || !authReady) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
            </div>
        )
    }

    return (
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <Routes>
                    {/* Auth routes with AuthLayout */}
                    <Route path="/schedule/preview" element={<SchedulePreview />} />
                    <Route path="/notion/databases" element={<NotionDatabasePicker />} />
                    <Route path="/notion/mapping" element={<NotionMappingPreview />} />
                    <Route path="/notion/candidates" element={<NotionTaskCandidates />} />
                    <Route path="/notion/pages" element={<NotionPagePicker />} />
                    <Route path="/notion/page-candidates" element={<NotionPageCandidates />} />

                    <Route element={<AuthLayout />}>
                        <Route path="/signin" element={<SignIn />} />
                        <Route path="/signup" element={<SignUp />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                    </Route>

                    {/* Verify email and reset password - no layout */}
                    <Route path="/verify-email" element={<VerifyEmail />} />
                    <Route path="/reset-password" element={<ResetPassword />} />

                    {/* 2FA verification during login - no layout */}
                    <Route path="/auth/2fa-verify" element={<TwoFactorVerify />} />

                    {/* App routes with AppLayout */}
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
                            path="/settings/security"
                            element={
                                <ProtectedRoute>
                                    <SecuritySettings />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/settings/security/2fa-setup"
                            element={
                                <ProtectedRoute>
                                    <TwoFactorSetup />
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

                    <Route path="/notion/callback" element={<NotionOAuthCallback />} />

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
                    success: {
                        iconTheme: {
                            primary: '#10B981',
                            secondary: '#fff',
                        },
                    },
                    error: {
                        iconTheme: {
                            primary: '#EF4444',
                            secondary: '#fff',
                        },
                    },
                }}
            />
        </QueryClientProvider>
    )
}

export default App