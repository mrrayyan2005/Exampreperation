import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type FeedSort = 'hot' | 'new' | 'top' | 'rising';

export interface ChannelSummary {
  _id: string;
  name: string;
  slug: string;
  icon?: string;
}

export interface Community {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  creatorId: string;
  numberOfMembers: number;
  privacyType: 'public' | 'restricted' | 'private';
  createdAt: string;
  imageURL?: string;
  bannerURL?: string;
}

export interface CommunitySnippet {
  communityId: string;
  communityName: string;
  communitySlug: string;
  isModerator?: boolean;
  imageURL?: string;
  joinedAt: string;
}

export interface Post {
  _id: string;
  communityId: string;
  communitySlug: string;
  communityName: string;
  communityImageURL?: string;
  creatorId: string;
  creatorName: string;
  creatorImageURL?: string;
  title: string;
  body: string;
  numberOfComments: number;
  voteStatus: number;
  imageURL?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PostVote {
  postId: string;
  communityId: string;
  voteValue: number;
}

export interface Comment {
  _id: string;
  postId: string;
  communityId: string;
  creatorId: string;
  creatorName: string;
  creatorImageURL?: string;
  body: string;
  parentId?: string;
  depth: number;
  upvotes: number;
  downvotes: number;
  score: number;
  childCount: number;
  createdAt: string;
  updatedAt: string;
}

interface CommunityState {
  // Community state
  mySnippets: CommunitySnippet[];
  currentCommunity: Community | null;
  snippetsFetched: boolean;
  communities: Community[];

  // Post state
  posts: Post[];
  selectedPost: Post | null;
  postVotes: PostVote[];

  // Comment state
  comments: Comment[];

  // UI state
  feedSort: FeedSort;
  unreadCommunityNotifs: number;
  loading: boolean;
  error: string | null;
}

const initialState: CommunityState = {
  mySnippets: [],
  currentCommunity: null,
  snippetsFetched: false,
  communities: [],
  posts: [],
  selectedPost: null,
  postVotes: [],
  comments: [],
  feedSort: 'hot',
  unreadCommunityNotifs: 0,
  loading: false,
  error: null,
};

const communitySlice = createSlice({
  name: 'community',
  initialState,
  reducers: {
    // Community actions
    setMySnippets(state, action: PayloadAction<CommunitySnippet[]>) {
      state.mySnippets = action.payload;
      state.snippetsFetched = true;
    },
    addSnippet(state, action: PayloadAction<CommunitySnippet>) {
      if (!state.mySnippets.find((s) => s.communityId === action.payload.communityId)) {
        state.mySnippets.push(action.payload);
      }
    },
    removeSnippet(state, action: PayloadAction<string>) {
      state.mySnippets = state.mySnippets.filter((s) => s.communityId !== action.payload);
    },
    setCurrentCommunity(state, action: PayloadAction<Community | null>) {
      state.currentCommunity = action.payload;
    },
    setCommunities(state, action: PayloadAction<Community[]>) {
      state.communities = action.payload;
    },

    // Post actions
    setPosts(state, action: PayloadAction<Post[]>) {
      state.posts = action.payload;
    },
    addPost(state, action: PayloadAction<Post>) {
      state.posts.unshift(action.payload);
    },
    updatePost(state, action: PayloadAction<Post>) {
      const index = state.posts.findIndex((p) => p._id === action.payload._id);
      if (index !== -1) {
        state.posts[index] = action.payload;
      }
      if (state.selectedPost?._id === action.payload._id) {
        state.selectedPost = action.payload;
      }
    },
    deletePost(state, action: PayloadAction<string>) {
      state.posts = state.posts.filter((p) => p._id !== action.payload);
      if (state.selectedPost?._id === action.payload) {
        state.selectedPost = null;
      }
    },
    setSelectedPost(state, action: PayloadAction<Post | null>) {
      state.selectedPost = action.payload;
    },
    setPostVotes(state, action: PayloadAction<PostVote[]>) {
      state.postVotes = action.payload;
    },
    updatePostVote(state, action: PayloadAction<PostVote>) {
      const index = state.postVotes.findIndex((v) => v.postId === action.payload.postId);
      if (index !== -1) {
        state.postVotes[index] = action.payload;
      } else {
        state.postVotes.push(action.payload);
      }
    },
    removePostVote(state, action: PayloadAction<string>) {
      state.postVotes = state.postVotes.filter((v) => v.postId !== action.payload);
    },

    // Comment actions
    setComments(state, action: PayloadAction<Comment[]>) {
      state.comments = action.payload;
    },
    addComment(state, action: PayloadAction<Comment>) {
      state.comments.push(action.payload);
      if (state.selectedPost) {
        state.selectedPost.numberOfComments += 1;
      }
      const parentPost = state.posts.find((p) => p._id === action.payload.postId);
      if (parentPost) {
        parentPost.numberOfComments += 1;
      }
    },

    // UI actions
    setFeedSort(state, action: PayloadAction<FeedSort>) {
      state.feedSort = action.payload;
    },
    incrementUnread(state) {
      state.unreadCommunityNotifs += 1;
    },
    clearUnread(state) {
      state.unreadCommunityNotifs = 0;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
    clearCommunityState(state) {
      state.mySnippets = [];
      state.snippetsFetched = false;
      state.postVotes = [];
    },
  },
});

export const {
  setMySnippets,
  addSnippet,
  removeSnippet,
  setCurrentCommunity,
  setCommunities,
  setPosts,
  addPost,
  updatePost,
  deletePost,
  setSelectedPost,
  setPostVotes,
  updatePostVote,
  removePostVote,
  setComments,
  addComment,
  setFeedSort,
  incrementUnread,
  clearUnread,
  setLoading,
  setError,
  clearCommunityState,
} = communitySlice.actions;

// Backward compatibility exports - wrapped action creators that transform payloads
export const setJoinedChannels = (channels: ChannelSummary[]) =>
  setMySnippets(channels.map((ch) => ({
    communityId: ch._id,
    communityName: ch.name,
    communitySlug: ch.slug,
    imageURL: ch.icon,
    isModerator: false,
    joinedAt: new Date().toISOString(),
  })));

export const addJoinedChannel = (channel: ChannelSummary) =>
  addSnippet({
    communityId: channel._id,
    communityName: channel.name,
    communitySlug: channel.slug,
    imageURL: channel.icon,
    isModerator: false,
    joinedAt: new Date().toISOString(),
  });

export const removeJoinedChannel = (channelId: string) => removeSnippet(channelId);
export const setCurrentChannelSlug = (slug: string | null) => setCurrentCommunity(null);
export const setCurrentPostId = (postId: string | null) => setSelectedPost(null);
export const setMyKarma = (payload: { channelId: string; karma: number }) => ({
  type: 'community/setMyKarma' as const,
  payload,
});

export default communitySlice.reducer;
