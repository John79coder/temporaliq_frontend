import { useState } from 'react'

export const useApi = <T = any>(
    apiCall: (...args: any[]) => Promise<T>
) => {
    const [data, setData] = useState<T | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    const execute = async (...args: any[]) => {
        setIsLoading(true)
        setError(null)

        try {
            const result = await apiCall(...args)
            setData(result)
            return result
        } catch (err: any) {
            setError(err.message || 'An error occurred')
            throw err
        } finally {
            setIsLoading(false)
        }
    }

    return { data, error, isLoading, execute }
}
