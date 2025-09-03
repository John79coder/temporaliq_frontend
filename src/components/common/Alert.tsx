// src/components/common/Alert.tsx
import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/utils/cn'

const alertVariants = cva(
    'relative w-full rounded-lg border p-4 [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg+div]:pl-7',
    {
        variants: {
            variant: {
                default: 'bg-white text-gray-900 border-gray-200',
                info: 'bg-blue-50 text-blue-900 border-blue-200',
                success: 'bg-green-50 text-green-900 border-green-200',
                warning: 'bg-amber-50 text-amber-900 border-amber-200',
                error: 'bg-red-50 text-red-900 border-red-200',
                destructive: 'bg-red-50 text-red-900 border-red-200',
            },
        },
        defaultVariants: {
            variant: 'default',
        },
    }
)

export interface AlertProps
    extends React.HTMLAttributes<HTMLDivElement>,
        VariantProps<typeof alertVariants> {
    children: React.ReactNode
}

export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
    ({ className, variant, children, ...props }, ref) => {
        return (
            <div
                ref={ref}
                role="alert"
                className={cn(alertVariants({ variant }), className)}
                {...props}
            >
                {children}
            </div>
        )
    }
)

Alert.displayName = 'Alert'