import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ChevronDown, Plus, Home, Compass } from 'lucide-react';
import type { RootState } from '@/redux/store';
import { cn } from '@/lib/utils';

interface CommunityDropdownProps {
  mySnippets: Array<{
    communityId: string;
    communityName: string;
    communitySlug: string;
    imageURL?: string;
  }>;
}

export const CommunityDropdown = ({ mySnippets }: CommunityDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { currentCommunity } = useSelector((state: RootState) => state.community);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentLabel = currentCommunity
    ? `r/${currentCommunity.name}`
    : 'Home';

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors',
          isOpen
            ? 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800'
            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
        )}
      >
        {currentCommunity?.imageURL ? (
          <img
            src={currentCommunity.imageURL}
            alt=""
            className="w-5 h-5 rounded-full"
          />
        ) : (
          <Home className="w-5 h-5 text-gray-500" />
        )}
        <span className="hidden sm:inline text-sm font-medium max-w-[120px] truncate">
          {currentLabel}
        </span>
        <ChevronDown
          className={cn(
            'w-4 h-4 text-gray-500 transition-transform',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-lg z-50 py-2">
          {/* Feeds Section */}
          <div className="px-3 py-2">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              Feeds
            </p>
            <Link
              to="/community"
              onClick={() => setIsOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                !currentCommunity
                  ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              )}
            >
              <Home className="w-5 h-5" />
              Home
            </Link>
            <Link
              to="/community/discover"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors mt-1"
            >
              <Compass className="w-5 h-5" />
              Discover
            </Link>
          </div>

          {/* My Communities Section */}
          {mySnippets.length > 0 && (
            <>
              <div className="border-t border-gray-200 dark:border-gray-800 my-2" />
              <div className="px-3 py-2">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                  My Communities
                </p>
                <div className="max-h-60 overflow-y-auto">
                  {mySnippets.map((snippet) => (
                    <Link
                      key={snippet.communityId}
                      to={`/r/${snippet.communitySlug}`}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                        currentCommunity?._id === snippet.communityId
                          ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                      )}
                    >
                      {snippet.imageURL ? (
                        <img
                          src={snippet.imageURL}
                          alt=""
                          className="w-6 h-6 rounded-full"
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
                          r/
                        </div>
                      )}
                      <span className="truncate">r/{snippet.communityName}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Create Community */}
          <div className="border-t border-gray-200 dark:border-gray-800 my-2" />
          <div className="px-3 py-2">
            <Link
              to="/community/discover"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Create Community
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityDropdown;
