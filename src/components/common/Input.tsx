import React, { useState } from 'react'
import { cn } from '@/utils/cn'
import { Eye, EyeOff, AlertCircle } from 'lucide-react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string
    error?: string
    hint?: string
    showPasswordToggle?: boolean
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, error, hint, type, showPasswordToggle, ...props }, ref) => {
        const [showPassword, setShowPassword] = useState(false)

        const inputType = showPasswordToggle && showPassword ? 'text' : type

        return (
            <div className="space-y-2">
                {label && (
                    <label className="block text-sm font-medium text-ui-text">
                        {label}
                    </label>
                )}

                <div className="relative">
                    <input
                        ref={ref}
                        type={inputType}
                        className={cn(
                            'w-full px-3 py-2 border border-ui-border rounded-lg',
                            'focus:outline-none focus:ring-2 focus:ring-apple-blue focus:border-transparent',
                            'placeholder:text-gray-400',
                            'transition-all duration-200',
                            error && 'border-red-500 focus:ring-red-500',
                            className
                        )}
                        {...props}
                    />

                    {showPasswordToggle && type === 'password' && (
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            {showPassword ? (
                                <EyeOff className="w-4 h-4" />
                            ) : (
                                <Eye className="w-4 h-4" />
                            )}
                        </button>
                    )}

                    {error && (
                        <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500" />
                    )}
                </div>

                {(error || hint) && (
                    <p className={cn(
                        'text-sm',
                        error ? 'text-red-500' : 'text-gray-500'
                    )}>
                        {error || hint}
                    </p>
                )}
            </div>
        )
    }
)

Input.displayName = 'Input'
