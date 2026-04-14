import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { SmartAvatar } from '@/components/ui/SmartAvatar';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { fetchProfile, logout } from '@/redux/slices/authSlice';
import axiosInstance from '@/api/axiosInstance';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User as UserIcon,
  Settings,
  Shield,
  Calendar,
  MapPin,
  School,
  Mail,
  Edit2,
  Save,
  X,
  Trophy,
  Flame,
  Clock,
  Target,
  CheckCircle2,
  LogOut,
  Camera,
  Bell,
  Moon,
  Sun,
  Eye,
  EyeOff,
  Briefcase,
  Star
} from 'lucide-react';
import UserBadges from '@/components/Community/UserBadges';

const Profile = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { plans } = useAppSelector((state) => state.monthlyPlans);
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [streakType, setStreakType] = useState<'study' | 'goals'>('study'); // Toggle between study and goals streak

  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    examTypes: [] as string[],
    examDate: '',
    bio: '',
    location: '',
    institution: '',
    profilePicture: '',
  });

  const [customGoal, setCustomGoal] = useState('');

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const availableExamTypes = ['UPSC', 'SSC', 'Banking', 'Railway', 'State PSC', 'Defense', 'Teaching', 'Other'];

  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      const allStandardTypes = ['UPSC', 'SSC', 'Banking', 'Railway', 'State PSC', 'Defense', 'Teaching', 'Other', 'General Start', 'General Study'];
      const nonStandardTypes = (user.examTypes || []).filter(t => !allStandardTypes.includes(t));
      const hasCustom = nonStandardTypes.length > 0;

      let initialExamTypes = user.examTypes || [];
      if (hasCustom && !initialExamTypes.includes('Other')) {
        initialExamTypes = [...initialExamTypes, 'Other'];
      }

      setCustomGoal(hasCustom ? nonStandardTypes[0] : '');

      const newProfileData = {
        name: user.name || '',
        email: user.email || '',
        examTypes: initialExamTypes,
        examDate: user.examDate ? new Date(user.examDate).toISOString().split('T')[0] : '',
        bio: user.bio ?? '',
        location: user.location ?? '',
        institution: user.institutionName ?? (typeof user.institution === 'string' ? user.institution : ''),
        profilePicture: user.profilePicture || '',
      };
      
      console.log('=== PROFILE DATA DEBUG ===');
      console.log('User from Redux:', {
        location: user.location,
        bio: user.bio,
        institutionName: user.institutionName,
        name: user.name
      });
      console.log('ProfileData being set:', newProfileData);
      
      setProfileData(newProfileData);
    }
  }, [user]);

  // Calculations
  const calculateStats = () => {
    const totalPlans = plans.length;
    const completedPlans = plans.filter(p => p.completed).length;

    const totalHours = plans.reduce((sum, plan) => {
      const multiplier = plan.targetType === 'hours' ? 1 :
        plan.targetType === 'chapters' ? 3 :
          plan.targetType === 'topics' ? 2 : 1;
      return sum + (plan.targetAmount * multiplier * (plan.progressPercentage || 0) / 100);
    }, 0);

    const completionRate = totalPlans > 0 ? Math.round((completedPlans / totalPlans) * 100) : 0;

    return {
      totalPlans,
      completedPlans,
      completionRate,
      totalHours: Math.round(totalHours),
      studyStreak: (user as any)?.progressStats?.currentStreak || 0,
      goalsStreak: (user as any)?.progressStats?.currentStreakGoals || 0,
      currentStreak: streakType === 'study' 
        ? (user as any)?.progressStats?.currentStreak || 0 
        : (user as any)?.progressStats?.currentStreakGoals || 0,
    };
  };

  const stats = calculateStats();
  const daysUntilExam = user?.examDate
    ? Math.ceil((new Date(user.examDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null;

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!profileData.name.trim()) {
      toast({ variant: 'destructive', title: 'Name is required' });
      setIsLoading(false);
      return;
    }

    let finalExamTypes = profileData.examTypes.filter(t => t !== 'General Start' && t !== 'General Study');

    if (finalExamTypes.includes('Other')) {
      finalExamTypes = finalExamTypes.filter(t => t !== 'Other');
      if (customGoal.trim()) {
        const goal = customGoal.trim().substring(0, 50);
        if (!finalExamTypes.includes(goal)) {
          finalExamTypes.push(goal);
        }
      } else if (finalExamTypes.length === 0) {
        toast({ variant: 'destructive', title: 'Please specify your "Other" Exam Goal' });
        setIsLoading(false);
        return;
      }
    } else {
      finalExamTypes = finalExamTypes.filter(t => availableExamTypes.includes(t));
    }

    if (finalExamTypes.length === 0) {
      toast({ variant: 'destructive', title: 'Please select at least one Exam Goal' });
      setIsLoading(false);
      return;
    }

    try {
      // Build update payload - always include all fields
      const updateData = {
        name: profileData.name.trim(),
        examTypes: finalExamTypes,
        location: profileData.location.trim(),
        institutionName: profileData.institution.trim(),
        bio: profileData.bio.trim(),
        ...(profileData.examDate && { examDate: new Date(profileData.examDate).toISOString() })
      };

      console.log('=== PROFILE UPDATE DEBUG ===');
      console.log('Sending to API:', updateData);

      const response = await axiosInstance.put('/auth/profile', updateData);
      console.log('API Response:', response.data);

      if (response.data.success && response.data.data?.user) {
        const updatedUser = response.data.data.user;
        console.log('Updated user from API:', updatedUser);

        // Update local state immediately with returned data
        setProfileData({
          name: updatedUser.name || '',
          email: updatedUser.email || '',
          examTypes: updatedUser.examTypes || [],
          examDate: updatedUser.examDate ? new Date(updatedUser.examDate).toISOString().split('T')[0] : '',
          bio: updatedUser.bio || '',
          location: updatedUser.location || '',
          institution: updatedUser.institutionName || '',
          profilePicture: updatedUser.profilePicture || '',
        });

        // Refresh Redux state
        await dispatch(fetchProfile());
        
        toast({
          title: 'Profile updated!',
          description: 'Your changes have been saved successfully.'
        });
        setIsEditing(false);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error: any) {
      console.error('Profile update error:', error);
      toast({
        variant: 'destructive',
        title: 'Update failed',
        description: error.response?.data?.message || error.message || 'Failed to update profile information.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({ variant: 'destructive', title: 'Passwords do not match' });
      return;
    }

    setIsLoading(true);
    try {
      await axiosInstance.put('/auth/password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      toast({ title: 'Password changed successfully' });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Password change failed',
        description: error.response?.data?.message || 'Something went wrong.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExamTypeToggle = (type: string) => {
    setProfileData(prev => {
      // Clean out placeholder defaults when a user interacts with real goals
      let currentTypes = prev.examTypes.filter(t => t !== 'General Start' && t !== 'General Study');

      if (currentTypes.includes(type)) {
        currentTypes = currentTypes.filter(t => t !== type);
      } else {
        currentTypes.push(type);
      }

      return {
        ...prev,
        examTypes: currentTypes
      };
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen pb-10 bg-background/50">
      {/* Header Banner */}
      <div className="relative h-48 md:h-64 rounded-b-[2.5rem] bg-gradient-to-r from-primary/80 via-purple-600/80 to-blue-600/80 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&q=80')] opacity-20 bg-cover bg-center mix-blend-overlay" />
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
      </div>

      <div className="container max-w-6xl mx-auto px-4 -mt-20 relative z-10">
        <div className="flex flex-col md:flex-row gap-8">

          {/* Left Column: Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full md:w-1/3 flex flex-col gap-6"
          >
            <Card className="border-border/50 shadow-xl backdrop-blur-sm overflow-hidden">
              <CardContent className="pt-6 pb-8 px-6 flex flex-col items-center text-center">
                <div className="relative mb-4">
                  <div className="group relative">
                    <SmartAvatar
                      src={profileData.profilePicture}
                      email={profileData.email}
                      name={profileData.name}
                      size="xl"
                      className="border-4 border-background shadow-2xl ring-2 ring-primary/20"
                      fallbackClassName="bg-primary/10 text-primary"
                    />
                    <div className="absolute inset-0 rounded-full flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                      <Camera className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <div className="absolute bottom-0 right-2 h-4 w-4 bg-green-500 rounded-full border-2 border-background ring-2 ring-green-500/20" />
                </div>

                <h2 className="text-2xl font-bold text-foreground mb-1">{profileData.name || 'User'}</h2>
                <p className="text-muted-foreground flex items-center justify-center gap-1.5 mb-4">
                  <Mail className="h-3.5 w-3.5" />
                  {profileData.email}
                </p>

                <div className="flex flex-wrap justify-center gap-2 mb-6">
                  {profileData.examTypes.filter(t => t !== 'Other' && t !== 'General Start' && t !== 'General Study').map(type => (
                    <Badge key={type} variant="secondary" className="px-3 py-1 bg-secondary/50 backdrop-blur-sm">
                      {type}
                    </Badge>
                  ))}
                </div>

                <div className="w-full grid grid-cols-2 gap-4 mb-6">
                  <div className="flex flex-col items-center p-3 rounded-xl bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer" 
                       onClick={() => setStreakType(streakType === 'study' ? 'goals' : 'study')}>
                    <Flame className="h-5 w-5 text-orange-500 mb-1" />
                    <span className="text-xl font-bold">{stats.currentStreak}</span>
                    <span className="text-xs text-muted-foreground">
                      {streakType === 'study' ? 'Study Streak' : 'Goal Streak'}
                    </span>
                    <span className="text-xs text-primary mt-1">(Click to toggle)</span>
                  </div>
                  <div className="flex flex-col items-center p-3 rounded-xl bg-blue-500/5 hover:bg-blue-500/10 transition-colors">
                    <Trophy className="h-5 w-5 text-blue-500 mb-1" />
                    <span className="text-xl font-bold">{stats.completedPlans}</span>
                    <span className="text-xs text-muted-foreground">Plans Done</span>
                  </div>
                </div>

                <div className="w-full mb-6 p-4 rounded-xl bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold flex items-center gap-2 text-yellow-600">
                      <Star className="h-4 w-4 fill-yellow-500" />
                      Community Karma
                    </span>
                    <span className="text-xl font-black text-yellow-700">{(user as any)?.progressStats?.karma || 0}</span>
                  </div>
                  <UserBadges />
                </div>

                {/* Streak comparison */}
                {(stats.studyStreak > 0 || stats.goalsStreak > 0) && (
                  <div className="w-full mb-4 p-3 rounded-lg bg-muted/30 text-xs text-muted-foreground space-y-1">
                    <div className="flex justify-between">
                      <span>Study Streak:</span>
                      <span className="font-semibold text-foreground">{stats.studyStreak} days</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Goal Streak:</span>
                      <span className="font-semibold text-foreground">{stats.goalsStreak} days</span>
                    </div>
                  </div>
                )}

                {!isEditing && (
                  <Button onClick={() => { setIsEditing(true); setActiveTab('settings'); }} className="w-full gap-2">
                    <Edit2 className="h-4 w-4" />
                    Edit Profile
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Quick Info Card */}
            <Card className="border-border/50 shadow-lg backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <UserIcon className="h-4 w-4 text-primary" />
                  Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-foreground">{profileData.location && profileData.location.trim() ? profileData.location : 'Location not set'}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <School className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-foreground">{profileData.institution && profileData.institution.trim() ? profileData.institution : 'Institution not set'}</span>
                </div>
                <div className="flex items-start gap-3 text-sm">
                  <Briefcase className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                  <p className="text-muted-foreground leading-relaxed">
                    {profileData.bio && profileData.bio.trim() ? profileData.bio : 'No bio added yet. Tell us about yourself!'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Right Column: Content */}
          <div className="w-full md:w-2/3">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="bg-background/95 backdrop-blur-sm border border-border/50 p-1 w-full flex justify-start overflow-x-auto rounded-xl h-12">
                <TabsTrigger value="overview" className="flex-1 min-w-[100px] h-full rounded-lg data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                  Overview
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex-1 min-w-[100px] h-full rounded-lg data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                  Edit Profile
                </TabsTrigger>
                <TabsTrigger value="security" className="flex-1 min-w-[100px] h-full rounded-lg data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                  Security
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6 mt-0">
                {/* Countdown Banner */}
                {daysUntilExam !== null && (
                  <Card className="bg-gradient-to-br from-primary/10 to-blue-500/10 border-primary/20">
                    <CardContent className="flex items-center justify-between p-6">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                          <Calendar className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">Upcoming Exam</h3>
                          <p className="text-muted-foreground">Target Date: {new Date(profileData.examDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="text-right hidden sm:block">
                        <span className="text-3xl font-bold text-primary">{daysUntilExam}</span>
                        <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Days Left</p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6 flex flex-col gap-2">
                      <span className="text-muted-foreground text-sm font-medium flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Study Hours
                      </span>
                      <span className="text-2xl font-bold">{stats.totalHours}h</span>
                      <Progress value={Math.min(stats.totalHours, 100)} className="h-1.5 mt-2" />
                    </CardContent>
                  </Card>
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6 flex flex-col gap-2">
                      <span className="text-muted-foreground text-sm font-medium flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        Completion Rate
                      </span>
                      <span className="text-2xl font-bold">{stats.completionRate}%</span>
                      <Progress value={stats.completionRate} className="h-1.5 mt-2" color="bg-green-500" />
                    </CardContent>
                  </Card>
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6 flex flex-col gap-2">
                      <span className="text-muted-foreground text-sm font-medium flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4" />
                        Total Plans
                      </span>
                      <span className="text-2xl font-bold">{stats.totalPlans}</span>
                      <p className="text-xs text-muted-foreground mt-2">{stats.completedPlans} completed</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Achievements placeholders or lists could go here */}
              </TabsContent>

              <TabsContent value="settings" className="mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Edit Profile</CardTitle>
                    <CardDescription>Update your personal information and exam goals</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleProfileUpdate} className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="name">Full Name</Label>
                          <Input
                            id="name"
                            value={profileData.name}
                            onChange={e => setProfileData({ ...profileData, name: e.target.value })}
                            placeholder="John Doe"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="location">Location</Label>
                          <Input
                            id="location"
                            value={profileData.location}
                            onChange={e => setProfileData({ ...profileData, location: e.target.value })}
                            placeholder="City, Country"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="institution">Institution</Label>
                          <Input
                            id="institution"
                            value={profileData.institution}
                            onChange={e => setProfileData({ ...profileData, institution: e.target.value })}
                            placeholder="University / College"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="examDate">Target Exam Date</Label>
                          <Input
                            id="examDate"
                            type="date"
                            value={profileData.examDate}
                            onChange={e => setProfileData({ ...profileData, examDate: e.target.value })}
                            min={new Date().toISOString().split('T')[0]}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea
                          id="bio"
                          value={profileData.bio}
                          onChange={e => setProfileData({ ...profileData, bio: e.target.value })}
                          placeholder="Tell us a bit about yourself and your goals..."
                          className="min-h-[100px] resize-none"
                        />
                      </div>

                      <div className="space-y-3">
                        <Label>Exam Goals</Label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {availableExamTypes.map(type => (
                            <div
                              key={type}
                              onClick={() => handleExamTypeToggle(type)}
                              className={`
                                cursor-pointer rounded-lg border p-3 flex items-center justify-between transition-all
                                ${profileData.examTypes.includes(type)
                                  ? 'bg-primary/5 border-primary ring-1 ring-primary/20'
                                  : 'hover:bg-muted/50 border-border'}
                              `}
                            >
                              <span className="text-sm font-medium">{type}</span>
                              {profileData.examTypes.includes(type) && (
                                <CheckCircle2 className="h-4 w-4 text-primary" />
                              )}
                            </div>
                          ))}
                        </div>

                        <AnimatePresence>
                          {profileData.examTypes.includes('Other') && (
                            <motion.div
                              initial={{ opacity: 0, height: 0, y: -10 }}
                              animate={{ opacity: 1, height: 'auto', y: 0 }}
                              exit={{ opacity: 0, height: 0, y: -10 }}
                              className="overflow-hidden pt-4 pb-2 px-1"
                            >
                              <Label htmlFor="customGoal" className="mb-2 block text-sm font-medium">Specify your custom goal</Label>
                              <Input
                                id="customGoal"
                                maxLength={50}
                                value={customGoal}
                                onChange={(e) => setCustomGoal(e.target.value)}
                                placeholder="e.g. GRE, GMAT, TOEFL (max 50 chars)"
                                className="max-w-md w-full bg-background border-border"
                                autoFocus
                              />
                            </motion.div>
                          )}
                        </AnimatePresence>

                      </div>

                      <div className="flex justify-end pt-4 gap-3">
                        <Button type="button" variant="outline" onClick={() => setActiveTab('overview')}>Cancel</Button>
                        <Button type="submit" disabled={isLoading} className="min-w-[120px]">
                          {isLoading ? (
                            <span className="flex items-center gap-2">
                              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                              Saving...
                            </span>
                          ) : (
                            <span className="flex items-center gap-2">
                              <Save className="h-4 w-4" />
                              Save Changes
                            </span>
                          )}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="security" className="mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Security Settings</CardTitle>
                    <CardDescription>Manage your password and account security</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handlePasswordChange} className="space-y-6 max-w-md">
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword">Current Password</Label>
                        <Input
                          id="currentPassword"
                          type="password"
                          value={passwordData.currentPassword}
                          onChange={e => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                        />
                      </div>

                      <Separator className="my-4" />

                      <div className="space-y-2">
                        <Label htmlFor="newPassword">New Password</Label>
                        <Input
                          id="newPassword"
                          type="password"
                          value={passwordData.newPassword}
                          onChange={e => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                          minLength={6}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          value={passwordData.confirmPassword}
                          onChange={e => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                          minLength={6}
                        />
                      </div>

                      <div className="pt-2">
                        <Button type="submit" disabled={isLoading} variant="secondary" className="w-full sm:w-auto">
                          Update Password
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>

                <Card className="mt-6 border-destructive/20 bg-destructive/5">
                  <CardHeader>
                    <CardTitle className="text-destructive flex items-center gap-2">
                      <LogOut className="h-5 w-5" />
                      Sign Out
                    </CardTitle>
                    <CardDescription>
                      Sign out of your account on this device
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        dispatch(logout());
                        window.location.href = '/login';
                      }}
                    >
                      Sign Out Now
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">
                      Only sign out if you are on a shared computer.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
