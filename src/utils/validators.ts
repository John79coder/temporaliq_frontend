export const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
}

export const validatePassword = (password: string): {
    isValid: boolean
    errors: string[]
} => {
    const errors: string[] = []

    if (password.length < 8) {
        errors.push('Password must be at least 8 characters')
    }

    if (!/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter')
    }

    if (!/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter')
    }

    if (!/[0-9]/.test(password)) {
        errors.push('Password must contain at least one number')
    }

    if (!/[!@#$%^&*]/.test(password)) {
        errors.push('Password must contain at least one special character')
    }

    return {
        isValid: errors.length === 0,
        errors
    }
}

export const getPasswordStrength = (password: string): {
    score: number
    label: string
    color: string
} => {
    let score = 0

    if (password.length >= 8) score++
    if (password.length >= 12) score++
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++
    if (/[0-9]/.test(password)) score++
    if (/[!@#$%^&*]/.test(password)) score++

    const strengthMap = [
        { label: 'Very Weak', color: 'bg-red-500' },
        { label: 'Weak', color: 'bg-orange-500' },
        { label: 'Fair', color: 'bg-yellow-500' },
        { label: 'Good', color: 'bg-blue-500' },
        { label: 'Strong', color: 'bg-green-500' },
        { label: 'Very Strong', color: 'bg-green-600' }
    ]

    return {
        score,
        ...strengthMap[score]
    }
}
