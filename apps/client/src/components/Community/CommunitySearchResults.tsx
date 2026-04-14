import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Hash, FileText, Users, ArrowRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface CommunitySearchResultsProps {
  posts: any[];
  channels: any[];
  query: string;
}

export const CommunitySearchResults: React.FC<CommunitySearchResultsProps> = ({
  posts,
  channels,
  query,
}) => {
  if (posts.length === 0 && channels.length === 0) return null;

  return (
    <div className="space-y-4">
      {/* Channels section */}
      {channels.length > 0 && (
        <div>
          <div className="flex items-center gap-2 px-1 mb-2">
            <Hash className="h-3.5 w-3.5 text-primary" />
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Channels
            </p>
          </div>
          <div className="space-y-1">
            {channels.map((ch: any) => (
              <Link
                key={ch._id}
                to={`/community/channel/${ch.slug}`}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted/60 transition-colors group"
              >
                {ch.icon ? (
                  <img src={ch.icon} alt="" className="h-8 w-8 rounded-full object-cover flex-shrink-0" />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-primary">{ch.name[0]}</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate group-hover:text-primary transition-colors">
                    {ch.name}
                  </p>
                  {ch.description && (
                    <p className="text-[11px] text-muted-foreground truncate">{ch.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground flex-shrink-0">
                  <Users className="h-3 w-3" />
                  {ch.memberCount}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Posts section */}
      {posts.length > 0 && (
        <div>
          <div className="flex items-center gap-2 px-1 mb-2">
            <FileText className="h-3.5 w-3.5 text-primary" />
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Community Posts
            </p>
          </div>
          <div className="space-y-1">
            {posts.map((post: any) => (
              <Link
                key={post._id}
                to={`/community/post/${post._id}`}
                className="flex items-start gap-3 px-3 py-2 rounded-lg hover:bg-muted/60 transition-colors group"
              >
                <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate group-hover:text-primary transition-colors line-clamp-1">
                    {post.title}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {post.channelId && (
                      <span className="text-[10px] text-primary font-medium">
                        {post.channelId.name}
                      </span>
                    )}
                    <span className="text-[10px] text-muted-foreground">
                      {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      · {post.commentCount} comments
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {posts.length >= 8 && (
            <Link
              to={`/community?q=${encodeURIComponent(query)}`}
              className="flex items-center gap-1 text-xs text-primary hover:underline px-3 mt-2"
            >
              See all community results <ArrowRight className="h-3 w-3" />
            </Link>
          )}
        </div>
      )}
    </div>
  );
};
