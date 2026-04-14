import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useSelector } from 'react-redux';
import type { RootState } from '@/redux/store';
import { useCommunity } from '@/hooks/useCommunity';
import { usePosts } from '@/hooks/usePosts';
import { ForumPostCard } from '@/components/Community/ForumPostCard';
import {
  ForumCommunityHeader,
  ForumCommunityAbout,
} from '@/components/Community/ForumCommunityHeader';
import { PageContent, MainContent, Sidebar } from '@/components/Layout/PageContent';
import { Button } from '@/components/ui/button';
import api from '@/api/axiosInstance';
import type { Post, PostVote } from '@/redux/slices/communitySlice';

export const ForumChannelFeed = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const [posts, setPosts] = useState<Post[]>([]);
  const [postVotes, setPostVotes] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const {
    currentCommunity,
    mySnippets,
    getCommunityData,
    onJoinOrLeaveCommunity,
  } = useCommunity();

  const isJoined = mySnippets.some((s) => s.communitySlug === slug);

  const fetchPosts = useCallback(async () => {
    if (!slug) return;
    try {
      setLoading(true);
      const response = await api.get(`/community/channels/${slug}/feed`, {
        params: { sort: 'hot', page: 1, limit: 20 },
      });

      const postsData: Post[] = response.data.data.posts.map((p: any) => ({
        _id: p._id,
        communityId: p.channelId?._id || '',
        communitySlug: slug,
        communityName: p.channelId?.name || '',
        communityImageURL: p.channelId?.icon,
        creatorId: p.authorId?._id || '',
        creatorName: p.authorId?.name || '',
        creatorImageURL: p.authorId?.profilePicture,
        title: p.title,
        body: p.body,
        numberOfComments: p.commentCount || 0,
        voteStatus: p.score || 0,
        imageURL: p.media?.[0]?.url,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      }));

      setPosts(postsData);

      // Map user's votes
      const votes: Record<string, number> = {};
      response.data.data.posts.forEach((p: any) => {
        if (p.userVote) {
          votes[p._id] = p.userVote;
        }
      });
      setPostVotes(votes);
    } catch (error) {
      console.error('Fetch posts error:', error);
      toast.error('Failed to load posts');
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    if (slug) {
      getCommunityData(slug);
      fetchPosts();
    }
  }, [slug, getCommunityData, fetchPosts]);

  const handleVote = async (post: Post, vote: number) => {
    if (!user) {
      toast.error('Please login to vote');
      return;
    }

    const existingVote = postVotes[post._id] || 0;
    let newVoteStatus = post.voteStatus;

    // Optimistic update
    if (existingVote === 0) {
      newVoteStatus = post.voteStatus + vote;
      setPostVotes({ ...postVotes, [post._id]: vote });
    } else if (existingVote === vote) {
      newVoteStatus = post.voteStatus - vote;
      const newVotes = { ...postVotes };
      delete newVotes[post._id];
      setPostVotes(newVotes);
      vote = 0; // Remove vote
    } else {
      newVoteStatus = post.voteStatus + 2 * vote;
      setPostVotes({ ...postVotes, [post._id]: vote });
    }

    setPosts(
      posts.map((p) =>
        p._id === post._id ? { ...p, voteStatus: newVoteStatus } : p
      )
    );

    try {
      await api.post('/community/votes', {
        targetId: post._id,
        targetType: 'post',
        value: vote,
      });
    } catch (error) {
      console.error('Vote error:', error);
      toast.error('Failed to vote');
      // Revert would go here
    }
  };

  const handleDeletePost = async (post: Post): Promise<boolean> => {
    try {
      await api.delete(`/community/posts/${post._id}`);
      setPosts(posts.filter((p) => p._id !== post._id));
      toast.success('Post deleted');
      return true;
    } catch (error) {
      console.error('Delete error:', error);
      return false;
    }
  };

  const handleSelectPost = (post: Post) => {
    navigate(`/community/post/${post._id}`);
  };

  if (!currentCommunity && loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-950">
        <div className="h-32 bg-gray-300 dark:bg-gray-800 animate-pulse" />
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-32 bg-white dark:bg-gray-900 rounded-lg animate-pulse"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950">
      {currentCommunity && (
        <ForumCommunityHeader
          community={currentCommunity}
          isJoined={isJoined}
          onJoinOrLeave={() =>
            onJoinOrLeaveCommunity(currentCommunity, isJoined)
          }
          loading={false}
        />
      )}

      <PageContent>
        <MainContent>
          {/* Create Post Button */}
          {isJoined && (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                  {user?.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <button
                  onClick={() => setCreateModalOpen(true)}
                  className="flex-1 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 text-sm rounded-md py-2 px-4 text-left transition-colors"
                >
                  Create Post
                </button>
                <Button
                  size="sm"
                  onClick={() => setCreateModalOpen(true)}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Posts Feed */}
          <div className="space-y-2">
            {loading ? (
              [1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-32 bg-white dark:bg-gray-900 rounded-lg animate-pulse"
                />
              ))
            ) : posts.length === 0 ? (
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-8 text-center">
                <p className="text-gray-500 dark:text-gray-400">
                  No posts yet. Be the first to post!
                </p>
                {isJoined && (
                  <Button
                    className="mt-4"
                    onClick={() => setCreateModalOpen(true)}
                  >
                    Create Post
                  </Button>
                )}
              </div>
            ) : (
              posts.map((post) => (
                <ForumPostCard
                  key={post._id}
                  post={post}
                  userVoteValue={postVotes[post._id]}
                  onVote={handleVote}
                  onDeletePost={handleDeletePost}
                  onSelectPost={handleSelectPost}
                />
              ))
            )}
          </div>
        </MainContent>

        <Sidebar>
          {currentCommunity && (
            <ForumCommunityAbout community={currentCommunity} />
          )}

          {/* Community Rules / Info */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Community Rules
            </h4>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
              <li>1. Be respectful to others</li>
              <li>2. No spam or self-promotion</li>
              <li>3. Stay on topic</li>
              <li>4. Use appropriate tags</li>
            </ul>
          </div>
        </Sidebar>
      </PageContent>
    </div>
  );
};

export default ForumChannelFeed;
