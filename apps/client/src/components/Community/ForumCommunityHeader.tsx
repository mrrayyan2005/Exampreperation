import { useSelector } from 'react-redux';
import { format } from 'date-fns';
import { Cake } from 'lucide-react';
import type { RootState } from '@/redux/store';
import type { Community } from '@/redux/slices/communitySlice';
import { SmartAvatar } from '@/components/ui/SmartAvatar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ForumCommunityHeaderProps {
  community: Community;
  isJoined: boolean;
  onJoinOrLeave: () => void;
  loading?: boolean;
}

export const ForumCommunityHeader = ({
  community,
  isJoined,
  onJoinOrLeave,
  loading = false,
}: ForumCommunityHeaderProps) => {
  const { user } = useSelector((state: RootState) => state.auth);

  return (
    <div className="w-full">
      {/* Banner */}
      <div className="h-20 sm:h-32 bg-gradient-to-r from-blue-400 to-blue-600" />

      {/* Content */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 pb-4">
            {/* Community Icon */}
            <div className="relative -mt-4 sm:-mt-8">
              {community.imageURL ? (
                <img
                  src={community.imageURL}
                  alt={community.name}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-white dark:border-gray-900 bg-white dark:bg-gray-800"
                />
              ) : (
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-white dark:border-gray-900 bg-blue-500 flex items-center justify-center">
                  <span className="text-white text-2xl sm:text-3xl font-bold">
                    r/
                  </span>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
                {community.name}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                r/{community.slug}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {user && (
                <Button
                  variant={isJoined ? 'outline' : 'default'}
                  onClick={onJoinOrLeave}
                  disabled={loading}
                  className={cn(
                    'min-w-[100px]',
                    isJoined && 'border-blue-500 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950'
                  )}
                >
                  {loading ? '...' : isJoined ? 'Joined' : 'Join'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface ForumCommunityAboutProps {
  community: Community;
}

export const ForumCommunityAbout = ({ community }: ForumCommunityAboutProps) => {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-blue-500 px-4 py-2">
        <h3 className="text-white font-semibold text-sm">About Community</h3>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {community.description && (
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {community.description}
          </p>
        )}

        {/* Stats */}
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Cake className="w-4 h-4" />
          <span>
            Created {format(new Date(community.createdAt), 'MMM d, yyyy')}
          </span>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-800 pt-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {community.numberOfMembers.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Members</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForumCommunityHeader;
