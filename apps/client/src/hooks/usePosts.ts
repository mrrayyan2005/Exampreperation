import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import type { RootState } from '@/redux/store';
import {
  updatePost,
  deletePost as deletePostAction,
  setSelectedPost,
  updatePostVote,
  removePostVote,
  Post,
} from '@/redux/slices/communitySlice';
import api from '@/api/axiosInstance';

interface UsePostsReturn {
  posts: Post[];
  selectedPost: Post | null;
  postVotes: { postId: string; voteValue: number }[];
  onVote: (post: Post, vote: number) => Promise<void>;
  onSelectPost: (post: Post) => void;
  onDeletePost: (post: Post) => Promise<boolean>;
}

export const usePosts = (): UsePostsReturn => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { posts, selectedPost, postVotes } = useSelector((state: RootState) => state.community);

  const onVote = useCallback(
    async (post: Post, vote: number) => {
      try {
        const existingVote = postVotes.find((v) => v.postId === post._id);
        const { voteStatus } = post;

        // Optimistic update
        let newVoteStatus = voteStatus;
        let voteChange = 0;

        if (!existingVote) {
          // New vote
          newVoteStatus = voteStatus + vote;
          voteChange = vote;
          dispatch(updatePostVote({ postId: post._id, communityId: post.communityId, voteValue: vote }));
        } else if (existingVote.voteValue === vote) {
          // Remove vote (toggle off)
          newVoteStatus = voteStatus - vote;
          voteChange = -vote;
          dispatch(removePostVote(post._id));
        } else {
          // Change vote (up -> down or down -> up)
          newVoteStatus = voteStatus + 2 * vote;
          voteChange = 2 * vote;
          dispatch(updatePostVote({ postId: post._id, communityId: post.communityId, voteValue: vote }));
        }

        // Update post in state
        dispatch(updatePost({ ...post, voteStatus: newVoteStatus }));

        // API call
        await api.post('/community/votes', {
          targetId: post._id,
          targetType: 'post',
          value: existingVote?.voteValue === vote ? 0 : vote,
        });
      } catch (error) {
        console.error('Vote error:', error);
        toast.error('Failed to vote. Please try again.');
        // Revert optimistic update on error would go here
      }
    },
    [dispatch, postVotes]
  );

  const onSelectPost = useCallback(
    (post: Post) => {
      dispatch(setSelectedPost(post));
      navigate(`/community/post/${post._id}`);
    },
    [dispatch, navigate]
  );

  const onDeletePost = useCallback(
    async (post: Post): Promise<boolean> => {
      try {
        await api.delete(`/community/posts/${post._id}`);
        dispatch(deletePostAction(post._id));
        toast.success('Post deleted successfully');

        if (selectedPost?._id === post._id) {
          navigate(`/community/r/${post.communitySlug}`);
        }

        return true;
      } catch (error) {
        console.error('Delete error:', error);
        toast.error('Failed to delete post');
        return false;
      }
    },
    [dispatch, navigate, selectedPost]
  );

  return {
    posts,
    selectedPost,
    postVotes,
    onVote,
    onSelectPost,
    onDeletePost,
  };
};

export default usePosts;
