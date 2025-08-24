import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/common/Button'

const Success: React.FC = () => {
    const navigate = useNavigate()

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Success!</h1>
                <p className="text-gray-600 mb-8">Your subscription is now active.</p>
                <Button onClick={() => navigate('/')}>
                    Go to Dashboard
                </Button>
            </div>
        </div>
    )
}

export default Success
