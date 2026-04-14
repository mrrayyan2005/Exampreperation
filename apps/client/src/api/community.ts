import axiosInstance from './axiosInstance';

const BASE = '/community';

// ── Channels ──────────────────────────────────────────────────────────────────
export const fetchChannels = (params?: { type?: string; search?: string; page?: number }) =>
  axiosInstance.get(`${BASE}/channels`, { params });

export const fetchChannel = (slug: string) => axiosInstance.get(`${BASE}/channels/${slug}`);

export const fetchJoinedChannels = () => axiosInstance.get(`${BASE}/channels/joined`);

export const joinChannel = (slug: string) => axiosInstance.post(`${BASE}/channels/${slug}/join`);

export const leaveChannel = (slug: string) => axiosInstance.delete(`${BASE}/channels/${slug}/leave`);

export const fetchChannelFeed = (
  slug: string,
  params?: { 
    sort?: string; 
    subchannelId?: string; 
    tag?: string; 
    type?: string;
    difficulty?: string;
    chapter?: string;
    resourceType?: string;
    level?: string;
    isSolved?: boolean;
    topic?: string;
    page?: number 
  }
) => axiosInstance.get(`${BASE}/channels/${slug}/feed`, { params });

export const createChannel = (data: {
  name: string;
  description: string;
  type: string;
  icon?: string;
  tags?: string[];
}) => axiosInstance.post(`${BASE}/channels`, data);

export const createSubchannel = (slug: string, data: { name: string; description?: string }) =>
  axiosInstance.post(`${BASE}/channels/${slug}/subchannels`, data);

// ── Study Rooms ───────────────────────────────────────────────────────────────
export const createStudyRoom = (slug: string, data: { name: string; description?: string; focusDuration?: number; breakDuration?: number }) =>
  axiosInstance.post(`${BASE}/channels/${slug}/rooms`, data);

export const fetchStudyRooms = (slug: string) =>
  axiosInstance.get(`${BASE}/channels/${slug}/rooms`);

export const fetchStudyRoom = (roomId: string) =>
  axiosInstance.get(`${BASE}/rooms/${roomId}`);

// ── Unified Feed ──────────────────────────────────────────────────────────────
export interface UnifiedFeedPost {
  _id: string;
  title: string;
  body?: string;
  type: string;
  tags: string[];
  score: number;
  upvotes: number;
  downvotes: number;
  commentCount: number;
  viewCount: number;
  isPinned: boolean;
  isLocked: boolean;
  isSolved: boolean;
  authorId: { _id: string; name: string; profilePicture?: string; email?: string };
  subchannelId?: { _id: string; name: string; slug: string };
  channelId: { _id: string; name: string; slug: string; icon?: string };
  userVote: number;
  poll?: {
    options: { text: string; votes: number }[];
    totalVotes: number;
    expiresAt?: string;
  };
  createdAt: string;
}

export interface UnifiedFeedResponse {
  posts: UnifiedFeedPost[];
  nextPage: number | null;
  hasMore: boolean;
}

export const fetchUnifiedFeed = (params: { 
  page?: number; 
  limit?: number; 
  sort?: string;
  type?: string;
  difficulty?: string;
  chapter?: string;
  resourceType?: string;
  level?: string;
  isSolved?: boolean;
  topic?: string;
}) => axiosInstance.get<{ data: UnifiedFeedResponse }>(`${BASE}/feed/unified`, { params });

export const fetchPopularFeed = (params: { 
  page?: number; 
  limit?: number; 
  sort?: string;
  type?: string;
  difficulty?: string;
  chapter?: string;
  resourceType?: string;
  level?: string;
  isSolved?: boolean;
  topic?: string;
}) => axiosInstance.get<{ data: UnifiedFeedResponse }>(`${BASE}/feed/popular`, { params });

export const fetchTrendingChannels = (limit?: number) =>
  axiosInstance.get(`${BASE}/channels/trending`, { params: { limit } });

// ── Posts ─────────────────────────────────────────────────────────────────────
export const createPost = (data: {
  channelId: string;
  subchannelId?: string;
  type?: string;
  title: string;
  body?: string;
  tags?: string[];
  poll?: {
    options: { text: string }[];
    expiresAt: string;
  };
  // Structured Question
  chapter?: string;
  difficulty?: string;
  questionSource?: string;
  whatITried?: string;
  whereImStuck?: string;
  // Resource
  resourceType?: string;
  level?: string;
  examRelevance?: string[];
  bounty?: number;
  isAnonymous?: boolean;
  examDate?: string;
  topic?: string;
}) => {
  // Only include subchannelId if it's truthy
  const payload = { ...data };
  if (!payload.subchannelId) {
    delete (payload as any).subchannelId;
  }
  return axiosInstance.post(`${BASE}/posts`, payload);
};

export const fetchPost = (postId: string) => axiosInstance.get(`${BASE}/posts/${postId}`);

export const deletePost = (postId: string, reason?: string) =>
  axiosInstance.delete(`${BASE}/posts/${postId}`, { data: { reason } });

// ── Comments ──────────────────────────────────────────────────────────────────
export const fetchComments = (postId: string, params?: { sort?: string; page?: number }) =>
  axiosInstance.get(`${BASE}/posts/${postId}/comments`, { params });

export const createComment = (data: { postId: string; parentId?: string; body: string; isAnonymous?: boolean }) =>
  axiosInstance.post(`${BASE}/comments`, data);

export const deleteComment = (commentId: string) =>
  axiosInstance.delete(`${BASE}/comments/${commentId}`);

export const markBestAnswer = (commentId: string) =>
  axiosInstance.patch(`${BASE}/comments/${commentId}/best-answer`);

export const verifyExpertAnswer = (commentId: string, isVerified: boolean) =>
  axiosInstance.patch(`${BASE}/comments/${commentId}/verify-expert`, { isVerified });

// ── Votes ─────────────────────────────────────────────────────────────────────
export const castVote = (data: {
  targetId: string;
  targetType: 'post' | 'comment';
  value: 1 | -1;
}) => axiosInstance.post(`${BASE}/votes`, data);

export const votePoll = (postId: string, optionIndex: number) =>
  axiosInstance.post(`${BASE}/posts/${postId}/poll/vote`, { optionIndex });
