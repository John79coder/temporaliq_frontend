import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Loader2 } from 'lucide-react'
import { cn } from '@/utils/cn'

const buttonVariants = cva(
    'inline-flex items-center justify-center rounded-lg font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-apple-blue focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
    {
        variants: {
            variant: {
                primary: 'bg-apple-blue text-white hover:bg-apple-blue-hover',
                secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
                ghost: 'hover:bg-gray-100 hover:text-gray-900',
                destructive: 'bg-red-500 text-white hover:bg-red-600',
            },
            size: {
                sm: 'h-9 px-3 text-sm',
                md: 'h-11 px-6',
                lg: 'h-[52px] px-8 text-lg',
            },
        },
        defaultVariants: {
            variant: 'primary',
            size: 'md',
        },
    }
)

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
        VariantProps<typeof buttonVariants> {
    isLoading?: boolean
    leftIcon?: React.ReactNode
    rightIcon?: React.ReactNode
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, isLoading, leftIcon, rightIcon, children, disabled, ...props }, ref) => {
        return (
            <button
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                disabled={disabled || isLoading}
                {...props}
            >
                {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    leftIcon && <span className="mr-2">{leftIcon}</span>
                )}
                {children}
                {rightIcon && <span className="ml-2">{rightIcon}</span>}
            </button>
        )
    }
)

Button.displayName = 'Button'
