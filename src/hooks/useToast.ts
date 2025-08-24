import toast from 'react-hot-toast'

export const useToast = () => {
    return {
        success: toast.success,
        error: toast.error,
        info: (message: string) => toast(message),
        loading: toast.loading,
    }
}
