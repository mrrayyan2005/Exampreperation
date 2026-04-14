import axiosInstance from './axiosInstance';

const BASE = '/community';

const fetchLeaderboard = (slug: string) =>
  axiosInstance.get(`${BASE}/channels/${slug}/leaderboard`).then((r) => r.data.data);

const summarizePost = (postId: string) =>
  axiosInstance.post(`${BASE}/posts/${postId}/summarize`).then((r) => r.data.data);

const getAnswerHints = (postId: string) =>
  axiosInstance.get(`${BASE}/posts/${postId}/answer-hints`).then((r) => r.data.data);

const castReport = (payload: any) =>
  axiosInstance.post(`${BASE}/reports`, payload).then((r) => r.data);

const resolveReport = ({ reportId, status, actionTaken }: any) =>
  axiosInstance.patch(`${BASE}/reports/${reportId}`, { status, actionTaken }).then((r) => r.data);

const getModQueue = ({ slug, status }: { slug: string; status: string }) =>
  axiosInstance
    .get(`${BASE}/channels/${slug}/mod-queue`, { params: { status } })
    .then((r) => r.data);

const updateChannelSettings = (slug: string, payload: any) =>
  axiosInstance.patch(`${BASE}/channels/${slug}/settings`, payload).then((r) => r.data);

const getChannelMembers = (slug: string, params?: any) =>
  axiosInstance.get(`${BASE}/channels/${slug}/members`, { params }).then((r) => r.data);

const updateMemberRole = (slug: string, userId: string, role: string) =>
  axiosInstance.patch(`${BASE}/channels/${slug}/members/${userId}/role`, { role }).then((r) => r.data);

const banMember = (slug: string, userId: string, payload: { isBanned: boolean; reason?: string }) =>
  axiosInstance.patch(`${BASE}/channels/${slug}/members/${userId}/ban`, payload).then((r) => r.data);

const getPendingPosts = (slug: string, params?: any) =>
  axiosInstance.get(`${BASE}/channels/${slug}/pending-posts`, { params }).then((r) => r.data);

const approvePost = (postId: string) =>
  axiosInstance.patch(`${BASE}/posts/${postId}/approve`).then((r) => r.data);

const rejectPost = (postId: string, reason?: string) =>
  axiosInstance.patch(`${BASE}/posts/${postId}/reject`, { reason }).then((r) => r.data);


export {
  fetchLeaderboard,
  summarizePost,
  getAnswerHints,
  castReport,
  resolveReport,
  getModQueue,
  updateChannelSettings,
  getChannelMembers,
  updateMemberRole,
  banMember,
  getPendingPosts,
  approvePost,
  rejectPost,
};
