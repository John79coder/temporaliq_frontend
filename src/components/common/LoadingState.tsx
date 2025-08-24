import React from 'react'
import { cn } from '@/utils/cn'

interface LoadingStateProps {
    className?: string
    text?: string
}

export const LoadingState: React.FC<LoadingStateProps> = ({
                                                              className,
                                                              text = 'Loading...'
                                                          }) => {
    return (
        <div className={cn('flex flex-col items-center justify-center p-8', className)}>
            <div className="relative">
                <div className="h-12 w-12 rounded-full border-4 border-gray-200" />
                <div className="absolute top-0 h-12 w-12 rounded-full border-4 border-apple-blue border-t-transparent animate-spin" />
            </div>
            {text && (
                <p className="mt-4 text-sm text-gray-600">{text}</p>
            )}
        </div>
    )
}

export const LoadingSkeleton: React.FC<{ className?: string }> = ({ className }) => {
    return (
        <div className={cn('animate-pulse', className)}>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
        </div>
    )
}
