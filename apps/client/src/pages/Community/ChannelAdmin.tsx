import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getChannelMembers, 
  updateMemberRole, 
  banMember, 
  updateChannelSettings,
  getPendingPosts,
  approvePost,
  rejectPost
} from '@/api/communityPhase2';
import { fetchChannel } from '@/api/community';
import { 
  ArrowLeft, 
  Settings, 
  Users, 
  ShieldAlert, 
  UserPlus, 
  Ban, 
  MoreVertical, 
  CheckCircle2, 
  XCircle,
  Clock,
  Shield,
  Star,
  User,
  Trash2,
  Lock,
  Eye,
  EyeOff,
  Globe,
  Tag,
  Plus
} from 'lucide-react';
import { SmartAvatar } from '@/components/ui/SmartAvatar';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const TABS = [
  { id: 'settings', label: 'Settings', icon: Settings },
  { id: 'automod', label: 'AutoMod', icon: ShieldAlert },
  { id: 'members', label: 'Members', icon: Users },
  { id: 'moderation', label: 'Post Queue', icon: Clock },
];

export const ChannelAdmin: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('settings');

  // Fetch channel for current settings
  const { data: channelData, isLoading: channelLoading } = useQuery({
    queryKey: ['channel', slug],
    queryFn: () => fetchChannel(slug!).then(r => r.data.data),
    enabled: !!slug,
  });

  const channel = channelData;

  if (channelLoading) return <div className="p-8 text-center">Loading...</div>;
  if (!channel) return <div className="p-8 text-center text-destructive">Channel not found</div>;

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(`/community/channel/${slug}`)}
            className="p-2 rounded-full hover:bg-muted transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              Manage Channel
            </h1>
            <p className="text-sm text-muted-foreground">{channel.name}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border mb-6">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2 px-6 py-3 text-sm font-semibold border-b-2 transition-all",
              activeTab === tab.id 
                ? "border-primary text-primary bg-primary/5" 
                : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="min-h-[400px]">
        {activeTab === 'settings' && <GeneralSettings channel={channel} slug={slug!} />}
        {activeTab === 'automod' && <AutoModerationSettings channel={channel} slug={slug!} />}
        {activeTab === 'members' && <MemberManagement slug={slug!} ownerId={channel.owner?._id || channel.owner} />}
        {activeTab === 'moderation' && <ModerationQueue slug={slug!} />}
      </div>
    </div>
  );
};

// --- Sub-components ---

const GeneralSettings = ({ channel, slug }: { channel: any, slug: string }) => {
  const queryClient = useQueryClient();
  const [settings, setSettings] = useState(channel.settings || {});
  
  const updateMutation = useMutation({
    mutationFn: (data: any) => updateChannelSettings(slug, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['channel', slug] });
      toast.success('Settings updated successfully');
    },
    onError: () => toast.error('Failed to update settings')
  });

  const handleSave = () => {
    updateMutation.mutate({ settings });
  };

  return (
    <div className="max-w-2xl space-y-8 bg-card rounded-2xl border border-border/60 p-6">
      <div className="space-y-6">
        <section>
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Privacy & Visibility</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4 p-3 rounded-xl border border-border/40 hover:bg-muted/30 transition-colors">
              <div className="flex gap-3">
                <div className="p-2 rounded-lg bg-blue-100 text-blue-600 h-fit">
                  {settings.memberVisibility === 'all' ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </div>
                <div>
                  <p className="text-sm font-bold">Public Member List</p>
                  <p className="text-xs text-muted-foreground">Allow regular members to see who else is in this group.</p>
                </div>
              </div>
              <button 
                onClick={() => setSettings(s => ({ ...s, memberVisibility: s.memberVisibility === 'all' ? 'moderators_only' : 'all' }))}
                className={cn(
                  "relative h-6 w-11 rounded-full transition-colors",
                  settings.memberVisibility === 'all' ? "bg-primary" : "bg-muted"
                )}
              >
                <div className={cn("absolute top-1 left-1 h-4 w-4 rounded-full bg-white transition-transform", settings.memberVisibility === 'all' && "translate-x-5")} />
              </button>
            </div>
            
            <div className="flex items-center justify-between gap-4 p-3 rounded-xl border border-border/40 hover:bg-muted/30 transition-colors">
              <div className="flex gap-3">
                <div className="p-2 rounded-lg bg-orange-100 text-orange-600 h-fit">
                  <ShieldAlert className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-bold">Post Moderation</p>
                  <p className="text-xs text-muted-foreground">Every new post requires approval from a moderator before going live.</p>
                </div>
              </div>
              <button 
                onClick={() => setSettings(s => ({ ...s, isPostModerationEnabled: !s.isPostModerationEnabled }))}
                className={cn(
                  "relative h-6 w-11 rounded-full transition-colors",
                  settings.isPostModerationEnabled ? "bg-primary" : "bg-muted"
                )}
              >
                <div className={cn("absolute top-1 left-1 h-4 w-4 rounded-full bg-white transition-transform", settings.isPostModerationEnabled && "translate-x-5")} />
              </button>
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Posting Permissions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {['all_members', 'experts_only', 'moderators_only'].map(role => (
               <button 
                key={role}
                onClick={() => setSettings(s => ({ ...s, whoCanPost: role }))}
                className={cn(
                  "flex flex-col items-start p-3 rounded-xl border transition-all text-left",
                  settings.whoCanPost === role ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border/40 hover:border-border"
                )}
               >
                 <span className="text-xs font-bold capitalize">{role.replace('_', ' ')}</span>
                 <span className="text-[10px] text-muted-foreground">Can create new posts & polls.</span>
               </button>
             ))}
          </div>
        </section>

        <button 
          onClick={handleSave}
          disabled={updateMutation.isPending}
          className="w-full bg-primary text-primary-foreground font-bold py-3 rounded-xl hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
        >
          {updateMutation.isPending && <Clock className="h-4 w-4 animate-spin" />}
          Save Changes
        </button>
      </div>
    </div>
  );
};

const AutoModerationSettings = ({ channel, slug }: { channel: any, slug: string }) => {
  const queryClient = useQueryClient();
  const [settings, setSettings] = useState(channel.settings || {});
  const [newKeyword, setNewKeyword] = useState('');
  
  const updateMutation = useMutation({
    mutationFn: (data: any) => updateChannelSettings(slug, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['channel', slug] });
      toast.success('AutoMod settings updated');
    }
  });

  const handleToggle = () => {
    updateMutation.mutate({ settings: { ...settings, isAutoModEnabled: !settings.isAutoModEnabled } });
  };

  const addKeyword = () => {
    if (!newKeyword.trim()) return;
    const updatedKeywords = [...(settings.bannedKeywords || []), newKeyword.trim()];
    const newSettings = { ...settings, bannedKeywords: updatedKeywords };
    setSettings(newSettings);
    updateMutation.mutate({ settings: newSettings });
    setNewKeyword('');
  };

  const removeKeyword = (word: string) => {
    const updatedKeywords = (settings.bannedKeywords || []).filter((k: string) => k !== word);
    const newSettings = { ...settings, bannedKeywords: updatedKeywords };
    setSettings(newSettings);
    updateMutation.mutate({ settings: newSettings });
  };

  return (
    <div className="max-w-2xl space-y-8 bg-card rounded-2xl border border-border/60 p-6">
      <div className="space-y-6">
        <section className="flex items-center justify-between gap-4 p-4 rounded-xl bg-primary/5 border border-primary/20">
          <div>
            <h3 className="font-bold text-sm">Enable Auto-Moderation</h3>
            <p className="text-xs text-muted-foreground">Automatically flag posts and block comments containing banned keywords.</p>
          </div>
          <button 
            onClick={handleToggle}
            className={cn(
              "relative h-6 w-11 rounded-full transition-colors",
              settings.isAutoModEnabled ? "bg-primary" : "bg-muted"
            )}
          >
            <div className={cn("absolute top-1 left-1 h-4 w-4 rounded-full bg-white transition-transform", settings.isAutoModEnabled && "translate-x-5")} />
          </button>
        </section>

        <section className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Banned Keywords</h3>
          <div className="flex gap-2">
            <input 
              type="text"
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addKeyword()}
              placeholder="Add word or phrase..."
              className="flex-1 bg-muted/40 border border-border/40 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <button 
              onClick={addKeyword}
              className="bg-primary text-primary-foreground p-2 rounded-xl hover:bg-primary/90 transition-all"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {(settings.bannedKeywords || []).map((word: string) => (
              <span 
                key={word}
                className="flex items-center gap-1.5 bg-muted px-3 py-1.5 rounded-full text-xs font-medium group hover:bg-red-50 hover:text-red-600 transition-colors cursor-default"
              >
                {word}
                <button onClick={() => removeKeyword(word)} className="opacity-40 group-hover:opacity-100">
                  <XCircle className="h-3.5 w-3.5" />
                </button>
              </span>
            ))}
            {(!settings.bannedKeywords || settings.bannedKeywords.length === 0) && (
              <p className="text-sm text-muted-foreground italic">No custom keywords added yet. Default spam filters are always active.</p>
            )}
          </div>
        </section>

        <div className="p-4 rounded-xl bg-orange-50 border border-orange-100 border-dashed">
           <div className="flex gap-3 text-orange-800">
             <ShieldAlert className="h-5 w-5 flex-shrink-0" />
             <div className="text-xs space-y-1">
                <p className="font-bold">How it works:</p>
                <ul className="list-disc list-inside space-y-1 opacity-80">
                  <li><strong>Posts:</strong> Flagged posts are sent to the Moderation Queue for review.</li>
                  <li><strong>Comments:</strong> Comments containing these words are blocked instantly.</li>
                  <li><strong>Global List:</strong> We also filter for common scams and malicious links by default.</li>
                </ul>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};

const MemberManagement = ({ slug, ownerId }: { slug: string, ownerId: string }) => {
  const queryClient = useQueryClient();
  const { data: members, isLoading } = useQuery({
    queryKey: ['channel-members', slug],
    queryFn: () => getChannelMembers(slug).then(r => r.data),
  });

  const roleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string, role: string }) => updateMemberRole(slug, userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['channel-members', slug] });
      toast.success('Role updated');
    }
  });

  const banMutation = useMutation({
    mutationFn: ({ userId, isBanned }: { userId: string, isBanned: boolean }) => banMember(slug, userId, { isBanned }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['channel-members', slug] });
      toast.success('Membership updated');
    }
  });

  if (isLoading) return <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 bg-muted rounded-xl animate-pulse" />)}</div>;

  return (
    <div className="bg-card rounded-2xl border border-border/60 overflow-hidden">
      <table className="w-full text-left">
        <thead className="bg-muted/50 border-b border-border/60">
          <tr>
            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">User</th>
            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Role</th>
            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/40">
          {members.map((membership: any) => (
            <tr key={membership._id} className="hover:bg-muted/20 transition-colors">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <SmartAvatar 
                    src={membership.userId.profilePicture} 
                    name={membership.userId.name} 
                    email={membership.userId.email} 
                    className="h-9 w-9" 
                  />
                  <div>
                    <p className="text-sm font-bold">{membership.userId.name}</p>
                    <p className="text-[10px] text-muted-foreground">Joined {formatDistanceToNow(new Date(membership.joinedAt))} ago</p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <span className={cn(
                  "text-[10px] font-black uppercase px-2 py-0.5 rounded-full border",
                  membership.role === 'owner' ? "bg-amber-100 text-amber-700 border-amber-200" :
                  membership.role === 'moderator' ? "bg-indigo-100 text-indigo-700 border-indigo-200" :
                  membership.role === 'expert' ? "bg-emerald-100 text-emerald-700 border-emerald-200" :
                  "bg-slate-100 text-slate-700 border-slate-200"
                )}>
                  {membership.role}
                </span>
                {membership.isBanned && (
                  <span className="ml-2 bg-red-100 text-red-700 text-[10px] font-black px-2 py-0.5 rounded-full border border-red-200">
                    BANNED
                  </span>
                )}
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex items-center justify-end gap-2">
                  {membership.role !== 'owner' && (
                    <select 
                      className="text-xs border rounded-lg p-1 bg-background"
                      value={membership.role}
                      onChange={(e) => roleMutation.mutate({ userId: membership.userId._id, role: e.target.value })}
                    >
                      <option value="member">Member</option>
                      <option value="expert">Expert</option>
                      <option value="moderator">Moderator</option>
                    </select>
                  )}
                  {membership.userId._id !== ownerId && (
                     <button 
                      onClick={() => banMutation.mutate({ userId: membership.userId._id, isBanned: !membership.isBanned })}
                      className={cn(
                        "p-2 rounded-lg transition-colors border",
                        membership.isBanned ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "bg-red-50 text-red-600 border-red-200"
                      )}
                      title={membership.isBanned ? "Unban" : "Ban"}
                     >
                        <Ban className="h-3.5 w-3.5" />
                     </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const ModerationQueue = ({ slug }: { slug: string }) => {
  const queryClient = useQueryClient();
  const { data: pendingPosts, isLoading } = useQuery({
    queryKey: ['pending-posts', slug],
    queryFn: () => getPendingPosts(slug).then(r => r.data),
  });

  const approveMutation = useMutation({
    mutationFn: approvePost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-posts', slug] });
      toast.success('Post approved and published!');
    }
  });

  const rejectMutation = useMutation({
    mutationFn: (postId: string) => rejectPost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-posts', slug] });
      toast.error('Post rejected');
    }
  });

  if (isLoading) return <div className="space-y-4">{[1,2].map(i => <div key={i} className="h-32 bg-muted rounded-xl animate-pulse" />)}</div>;
  
  if (pendingPosts.length === 0) return (
    <div className="text-center py-20 bg-muted/20 rounded-2xl border border-dashed border-border">
      <CheckCircle2 className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
      <p className="font-semibold">Queue is empty</p>
      <p className="text-sm text-muted-foreground">All posts have been reviewed.</p>
    </div>
  );

  return (
    <div className="space-y-4">
      {pendingPosts.map((post: any) => (
        <div key={post._id} className="bg-card rounded-2xl border border-border/60 p-4 flex flex-col md:flex-row gap-4">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
               <SmartAvatar 
                src={post.authorId.profilePicture} 
                name={post.authorId.name} 
                email={post.authorId.email} 
                className="h-6 w-6" 
               />
               <span className="text-xs font-bold">{post.authorId.name}</span>
               <span className="text-[10px] text-muted-foreground">• {formatDistanceToNow(new Date(post.createdAt))} ago</span>
            </div>
            <h4 className="font-bold text-lg">{post.title}</h4>
            <p className="text-sm text-muted-foreground line-clamp-3">{post.bodyText}</p>
            <div className="flex gap-2">
               <span className="text-[10px] bg-muted px-2 py-0.5 rounded uppercase font-bold">{post.type}</span>
               {post.deleteReason && (
                 <span className="text-[10px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded font-black border border-orange-200">
                    {post.deleteReason}
                 </span>
               )}
            </div>
          </div>
          <div className="flex md:flex-col gap-2 justify-end">
             <button 
              onClick={() => approveMutation.mutate(post._id)}
              className="flex items-center justify-center gap-2 bg-emerald-600 text-white font-bold px-4 py-2 rounded-xl text-sm hover:bg-emerald-700 transition-all"
             >
                <CheckCircle2 className="h-4 w-4" /> Approve
             </button>
             <button 
              onClick={() => rejectMutation.mutate(post._id)}
              className="flex items-center justify-center gap-2 bg-red-50 text-red-600 border border-red-200 font-bold px-4 py-2 rounded-xl text-sm hover:bg-red-100 transition-all"
             >
                <XCircle className="h-4 w-4" /> Reject
             </button>
          </div>
        </div>
      ))}
    </div>
  );
};
