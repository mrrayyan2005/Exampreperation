import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LiveClockProps {
    className?: string;
    showIcon?: boolean;
}

const LiveClock = ({ className, showIcon = true }: LiveClockProps) => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setTime(new Date());
        }, 1000);

        return () => {
            clearInterval(timer);
        };
    }, []);

    return (
        <div className={cn("flex items-center gap-2 text-sm font-medium tabular-nums", className)}>
            {showIcon && <Clock className="h-4 w-4" />}
            <span>
                {time.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: true
                })}
            </span>
        </div>
    );
};

export default LiveClock;
