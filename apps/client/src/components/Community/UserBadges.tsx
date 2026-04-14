import React, { useEffect, useState } from 'react';
import axiosInstance from '@/api/axiosInstance';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Trophy, Award, Star, Medal } from 'lucide-react';
import { motion } from 'framer-motion';

interface Badge {
  _id: string;
  name: string;
  description: string;
  icon: string;
  type: string;
  level: number;
}

interface UserBadgesProps {
  userId?: string;
}

const UserBadges: React.FC<UserBadgesProps> = ({ userId }) => {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBadges = async () => {
      try {
        const url = userId ? `/community/badges/user/${userId}` : '/community/badges/me';
        const response = await axiosInstance.get(url);
        if (response.data.status === 'success') {
          setBadges(response.data.data.badges);
        }
      } catch (error) {
        console.error('Failed to fetch badges:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBadges();
  }, [userId]);

  if (loading) {
    return <div className="flex gap-2 animate-pulse">
      {[1, 2, 3].map(i => <div key={i} className="h-12 w-12 rounded-full bg-muted" />)}
    </div>;
  }

  if (badges.length === 0) {
    return <p className="text-sm text-muted-foreground italic">No badges earned yet. Keep contributing!</p>;
  }

  const getLevelColor = (level: number) => {
    switch (level) {
      case 1: return 'text-orange-400'; // Bronze
      case 2: return 'text-slate-400';   // Silver
      case 3: return 'text-yellow-400';  // Gold
      case 4: return 'text-cyan-400';    // Platinum/Expert
      default: return 'text-primary';
    }
  };

  return (
    <TooltipProvider>
      <div className="flex flex-wrap gap-4">
        {badges.map((badge, idx) => (
          <Tooltip key={badge._id}>
            <TooltipTrigger asChild>
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: idx * 0.1, type: 'spring', stiffness: 200 }}
                className={`
                  relative h-14 w-14 rounded-full bg-background border-2 flex items-center justify-center cursor-help
                  hover:shadow-lg hover:scale-110 transition-all duration-200
                  ${getLevelColor(badge.level).replace('text-', 'border-').replace('-400', '/30')}
                `}
              >
                <span className="text-2xl">{badge.icon}</span>
                <div className={`absolute -bottom-1 -right-1 p-0.5 rounded-full bg-background border ${getLevelColor(badge.level)}`}>
                  {badge.level === 1 && <Award className="h-3 w-3" />}
                  {badge.level === 2 && <Star className="h-3 w-3" />}
                  {badge.level >= 3 && <Trophy className="h-3 w-3" />}
                </div>
              </motion.div>
            </TooltipTrigger>
            <TooltipContent>
              <div className="text-center p-1">
                <p className="font-bold">{badge.name}</p>
                <p className="text-xs text-muted-foreground">{badge.description}</p>
              </div>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
};

export default UserBadges;
