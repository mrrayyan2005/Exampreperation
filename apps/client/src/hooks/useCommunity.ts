import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';
import type { RootState } from '@/redux/store';
import {
  setMySnippets,
  addSnippet,
  removeSnippet,
  setCurrentCommunity,
  setCommunities,
  Community,
  CommunitySnippet,
} from '@/redux/slices/communitySlice';
import api from '@/api/axiosInstance';

interface UseCommunityReturn {
  mySnippets: CommunitySnippet[];
  currentCommunity: Community | null;
  communities: Community[];
  snippetsFetched: boolean;
  loading: boolean;
  onJoinOrLeaveCommunity: (community: Community, isJoined: boolean) => Promise<void>;
  getMySnippets: () => Promise<void>;
  getCommunityData: (slug: string) => Promise<void>;
  getCommunities: () => Promise<void>;
}

export const useCommunity = (): UseCommunityReturn => {
  const dispatch = useDispatch();
  const { slug } = useParams<{ slug: string }>();
  const { mySnippets, currentCommunity, communities, snippetsFetched } = useSelector(
    (state: RootState) => state.community
  );
  const [loading, setLoading] = useState(false);

  const getMySnippets = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/community/channels/joined');
      const snippets: CommunitySnippet[] = response.data.data.map((channel: any) => ({
        communityId: channel._id,
        communityName: channel.name,
        communitySlug: channel.slug,
        imageURL: channel.icon,
        isModerator: channel.isModerator,
        joinedAt: channel.joinedAt,
      }));
      dispatch(setMySnippets(snippets));
    } catch (error) {
      console.error('Get snippets error:', error);
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  const getCommunityData = useCallback(
    async (communitySlug: string) => {
      try {
        setLoading(true);
        const response = await api.get(`/community/channels/${communitySlug}`);
        const channel = response.data.data;
        const community: Community = {
          _id: channel._id,
          name: channel.name,
          slug: channel.slug,
          description: channel.description,
          creatorId: channel.owner?._id || '',
          numberOfMembers: channel.memberCount || 0,
          privacyType: channel.settings?.isPrivate ? 'private' : 'public',
          createdAt: channel.createdAt,
          imageURL: channel.icon,
          bannerURL: channel.banner,
        };
        dispatch(setCurrentCommunity(community));
      } catch (error) {
        console.error('Get community error:', error);
      } finally {
        setLoading(false);
      }
    },
    [dispatch]
  );

  const getCommunities = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/community/channels');
      const communitiesData: Community[] = response.data.data.map((channel: any) => ({
        _id: channel._id,
        name: channel.name,
        slug: channel.slug,
        description: channel.description,
        creatorId: channel.owner?._id || '',
        numberOfMembers: channel.memberCount || 0,
        privacyType: channel.settings?.isPrivate ? 'private' : 'public',
        createdAt: channel.createdAt,
        imageURL: channel.icon,
        bannerURL: channel.banner,
      }));
      dispatch(setCommunities(communitiesData));
    } catch (error) {
      console.error('Get communities error:', error);
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  const onJoinOrLeaveCommunity = useCallback(
    async (community: Community, isJoined: boolean) => {
      try {
        setLoading(true);

        if (isJoined) {
          // Leave community
          await api.delete(`/community/channels/${community.slug}/leave`);
          dispatch(removeSnippet(community._id));
          toast.success(`Left r/${community.name}`);

          // Update current community member count
          if (currentCommunity?._id === community._id) {
            dispatch(
              setCurrentCommunity({
                ...currentCommunity,
                numberOfMembers: currentCommunity.numberOfMembers - 1,
              })
            );
          }
        } else {
          // Join community
          await api.post(`/community/channels/${community.slug}/join`);
          const newSnippet: CommunitySnippet = {
            communityId: community._id,
            communityName: community.name,
            communitySlug: community.slug,
            imageURL: community.imageURL,
            isModerator: false,
            joinedAt: new Date().toISOString(),
          };
          dispatch(addSnippet(newSnippet));
          toast.success(`Joined r/${community.name}`);

          // Update current community member count
          if (currentCommunity?._id === community._id) {
            dispatch(
              setCurrentCommunity({
                ...currentCommunity,
                numberOfMembers: currentCommunity.numberOfMembers + 1,
              })
            );
          }
        }
      } catch (error) {
        console.error('Join/Leave error:', error);
        toast.error('Failed to update membership');
      } finally {
        setLoading(false);
      }
    },
    [dispatch, currentCommunity]
  );

  // Load community data when slug changes
  useEffect(() => {
    if (slug && (!currentCommunity || currentCommunity.slug !== slug)) {
      getCommunityData(slug);
    }
  }, [slug, currentCommunity, getCommunityData]);

  return {
    mySnippets,
    currentCommunity,
    communities,
    snippetsFetched,
    loading,
    onJoinOrLeaveCommunity,
    getMySnippets,
    getCommunityData,
    getCommunities,
  };
};

export default useCommunity;
