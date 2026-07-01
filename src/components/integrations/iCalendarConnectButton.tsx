import { Calendar } from 'lucide-react'
import { Button } from '@/components/common/Button'

interface ICalendarConnectButtonProps {
    children?: React.ReactNode
    onClick?: () => void
    isLoading?: boolean
    className?: string
}

export default function ICalendarConnectButton({
                                                   onClick,
                                                   isLoading = false,
                                                   className,
                                               }: ICalendarConnectButtonProps) {
    return (
        <Button
            type="button"
            variant="subtle"
            size="sm"
            className={className}
            isLoading={isLoading}
            onClick={onClick}
            leftIcon={<Calendar className="h-4 w-4" />}
        >
            {isLoading ? 'Connecting…' : 'Connect Calendar'}
        </Button>
    )
}