import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface StatsCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    badge?: string;
    badgeVariant?: 'default' | 'success' | 'warning' | 'destructive' | 'primary';
    iconColor?: string;
    delay?: number;
}

const badgeVariants = {
    default: 'bg-muted text-muted-foreground border-muted/50',
    success: 'bg-success/20 text-success border-success/30',
    warning: 'bg-warning/20 text-warning border-warning/30',
    destructive: 'bg-destructive/20 text-destructive border-destructive/30',
    primary: 'bg-primary/20 text-primary border-primary/30',
};

export function StatsCard({
    title,
    value,
    icon: Icon,
    badge,
    badgeVariant = 'default',
    iconColor = 'text-primary',
    delay = 0,
}: StatsCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay }}
            className={cn(
                'bg-card/60 backdrop-blur-xl border border-border/50 rounded-2xl p-5',
                'hover:bg-card/80 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105'
            )}
        >
            <div className="flex items-center justify-between mb-3">
                <div
                    className={cn(
                        'w-10 h-10 rounded-xl flex items-center justify-center',
                        'bg-primary/10'
                    )}
                >
                    <Icon className={cn('w-5 h-5', iconColor)} />
                </div>
                {badge && (
                    <Badge
                        className={cn(
                            'text-xs border',
                            badgeVariants[badgeVariant]
                        )}
                    >
                        {badge}
                    </Badge>
                )}
            </div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                {title}
            </p>
            <p className="text-2xl font-bold text-foreground">{value}</p>
        </motion.div>
    );
}
