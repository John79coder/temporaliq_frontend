import { useAuthStore } from '@/stores/authStore'

export const useAuth = () => {
    const { user, isAuthenticated, isLoading } = useAuthStore()

    return {
        user,
        isAuthenticated,
        isLoading,
        isSubscribed: user?.isSubscribed || false,
        isInTrial: user?.isInTrial || false,
    }
}
