import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import CommunityLayout from "./pages/Community/CommunityLayout";
// import AIChat from "./components/AIChat";
import { Suspense, lazy } from 'react';
import { lazyLoad } from './utils/lazyLoad';
import PageLoader from './components/PageLoader';
import { Routes, Route } from "react-router-dom";
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from './redux/hooks';
import { fetchProfile } from './redux/slices/authSlice';

const LandingPage = lazyLoad(() => import("./pages/LandingPage"));
const Login = lazyLoad(() => import("./pages/Auth/Login"));
const Register = lazyLoad(() => import("./pages/Auth/Register"));
const ForgotPassword = lazyLoad(() => import("./pages/Auth/ForgotPassword"));
const ResetPassword = lazyLoad(() => import("./pages/Auth/ResetPassword"));
const Dashboard = lazyLoad(() => import("./pages/Dashboard/Dashboard"));
const Books = lazyLoad(() => import("./pages/Books/Books"));
const DailyGoals = lazyLoad(() => import("./pages/DailyGoals/DailyGoals"));
const MonthlyPlan = lazyLoad(() => import("./pages/MonthlyPlan/MonthlyPlan"));
const StudySessions = lazyLoad(() => import("./pages/StudySessions/StudySessions"));
const AdvancedProgress = lazyLoad(() => import("./pages/AdvancedProgress/AdvancedProgress"));
const Achievements = lazyLoad(() => import("./pages/Achievements/Achievements"));
const Profile = lazyLoad(() => import("./pages/Profile/Profile"));
const StudyGroups = lazyLoad(() => import("./pages/StudyGroups/StudyGroups"));
const StudyRooms = lazyLoad(() => import("./pages/StudyRooms/StudyRoomsModern"));
const SharedResources = lazyLoad(() => import("./pages/SharedResources/SharedResources"));
const Challenges = lazyLoad(() => import("./pages/Challenges/Challenges"));
const NotFound = lazyLoad(() => import("./pages/NotFound"));
const DeckList = lazyLoad(() => import("./pages/Flashcards/DeckList"));
const StudySession = lazyLoad(() => import("./pages/Flashcards/StudySession"));
const DeckEditor = lazyLoad(() => import("./pages/Flashcards/DeckEditor"));
const FlashcardsAnalytics = lazyLoad(() => import("./pages/Flashcards/Analytics"));
const TestList = lazyLoad(() => import("./pages/Tests/TestList"));
const TakeTest = lazyLoad(() => import("./pages/Tests/TakeTest"));
const MistakeNotebook = lazyLoad(() => import("./pages/Analytics/MistakeNotebook"));
const MistakePracticeMode = lazyLoad(() => import("./pages/Analytics/MistakePracticeMode"));
const MistakeAnalytics = lazyLoad(() => import("./pages/Analytics/MistakeAnalytics"));
const GenerateTest = lazyLoad(() => import("./pages/AiTests/GenerateTest"));
const TakeAdaptiveTest = lazyLoad(() => import("./pages/Tests/TakeAdaptiveTest"));
const ProgressDashboard = lazyLoad(() => import("./pages/Analytics/ProgressDashboard"));
const StudentGrouping = lazyLoad(() => import("./pages/Analytics/StudentGrouping"));
const InstitutionDashboard = lazyLoad(() => import("./pages/Institution/Dashboard"));
const Tasks = lazyLoad(() => import("./pages/Tasks/Tasks"));
const Exams = lazyLoad(() => import("./pages/Exams/Exams"));
const StudyNotes = lazyLoad(() => import("./pages/StudyNotes/StudyNotes"));
const TaskPlanner = lazyLoad(() => import("./pages/TaskPlanner"));
const RevisionCenter = lazyLoad(() => import("./pages/RevisionCenter/RevisionCenter"));
const UnifiedFeed = lazyLoad(() => import("./pages/Community/UnifiedFeed"));
const PopularFeed = lazyLoad(() => import("./pages/Community/PopularFeed"));
const CommunityHome = lazyLoad(() => import("./pages/Community/CommunityHome"));
const ChannelDiscover = lazyLoad(() => import("./pages/Community/ChannelDiscover"));
const ChannelFeed = lazyLoad(() => import("./pages/Community/ChannelFeed"));
const ModQueue = lazyLoad(() => import("./pages/Community/ModQueue"));
const ChannelAdmin = lazyLoad(() => import("./pages/Community/ChannelAdmin").then(m => ({ default: m.ChannelAdmin })));
const PostDetail = lazyLoad(() => import("./pages/Community/PostDetail"));
const StudyRoomNode = lazyLoad(() => import("./pages/Community/StudyRoomNode"));

// Forum-style Community Pages
const ForumChannelFeed = lazyLoad(() => import("./pages/Community/ForumChannelFeed"));
const ForumHomeFeed = lazyLoad(() => import("./pages/Community/ForumHomeFeed"));

const RoleRoute = lazyLoad(() => import("./components/RoleRoute"));
const AdminLayout = lazyLoad(() => import("./pages/Admin/AdminLayout"));
const AdminDashboard = lazyLoad(() => import("./pages/Admin/AdminDashboard"));
const UserManagement = lazyLoad(() => import("./pages/Admin/UserManagement"));
const UserProfileView = lazyLoad(() => import("./pages/Admin/UserProfileView"));
// Admin tool for bulk syllabus and question uploads
const AdminContent = lazyLoad(() => import("./pages/Admin/AdminContent"));

const About = lazyLoad(() => import("./pages/Marketing/About"));
const Blog = lazyLoad(() => import("./pages/Marketing/Blog"));
const Careers = lazyLoad(() => import("./pages/Marketing/Careers"));
const Contact = lazyLoad(() => import("./pages/Marketing/Contact"));
const Privacy = lazyLoad(() => import("./pages/Legal/Privacy"));
const Terms = lazyLoad(() => import("./pages/Legal/Terms"));
const Security = lazyLoad(() => import("./pages/Legal/Security"));

import { CommandPalette } from './components/Shared/CommandPalette';
import { PerformanceOverlay } from '@/components/Performance';

const App = () => {
  const dispatch = useAppDispatch();
  const { token, user, isInitialized, isLoading } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // Global auth initialization: if we have a token but no user, fetch profile
    if (token && !user && !isInitialized && !isLoading) {
      dispatch(fetchProfile());
    }
  }, [token, user, isInitialized, isLoading, dispatch]);

  return (
    <>
      <CommandPalette />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          {/* Marketing Pages */}
          <Route path="/about" element={<About />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/careers" element={<Careers />} />
          <Route path="/contact" element={<Contact />} />

          {/* Legal Pages */}
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/security" element={<Security />} />

          {/* Forum-Style Community Routes (Public) */}
          <Route path="r" element={<ForumHomeFeed />} />
          <Route path="r/:slug" element={<ForumChannelFeed />} />

          {/* Protected Section */}
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="subjects" element={<Books />} />
            <Route path="daily-goals" element={<DailyGoals />} />
            <Route path="monthly-plan" element={<MonthlyPlan />} />
            <Route path="study-sessions" element={<StudySessions />} />
            <Route path="advanced-progress" element={<AdvancedProgress />} />
            <Route path="achievements" element={<Achievements />} />
            <Route path="study-groups" element={<StudyGroups />} />
            <Route path="study-rooms" element={<StudyRooms />} />
            <Route path="shared-resources" element={<SharedResources />} />
            <Route path="challenges" element={<Challenges />} />
            <Route path="profile" element={<Profile />} />

            {/* New Exam Experience Routes */}
            <Route path="flashcards" element={<DeckList />} />
            <Route path="flashcards/analytics" element={<FlashcardsAnalytics />} />
            <Route path="flashcards/:deckId/edit" element={<DeckEditor />} />
            <Route path="flashcards/:deckId/study" element={<StudySession />} />
            {/* Tests routes disabled for now */}
            {/* <Route path="tests" element={<TestList />} />
            <Route path="tests/generate" element={<GenerateTest />} /> */}
            <Route path="tests/:testId/take" element={<TakeTest />} />
            <Route path="tests/:testId/adaptive" element={<TakeAdaptiveTest />} />
            <Route path="mistakes" element={<MistakeNotebook />} />
            <Route path="mistakes/practice" element={<MistakePracticeMode />} />
            <Route path="mistakes/analytics" element={<MistakeAnalytics />} />
            <Route path="track-my-progress" element={<ProgressDashboard />} />
            <Route path="student-grouping" element={<StudentGrouping />} />

            {/* Institution Routes */}
            <Route path="institution/dashboard" element={<InstitutionDashboard />} />

            {/* MyStudyLife Routes */}
            <Route path="tasks" element={<Tasks />} />
            <Route path="exams" element={<Exams />} />
            <Route path="notes" element={<StudyNotes />} />
            {/* <Route path="planner" element={<TaskPlanner />} /> */}

            {/* Revision Center */}
            <Route path="revision-center" element={<RevisionCenter />} />

            {/* Community Routes - New Layout */}
            <Route path="community" element={<CommunityLayout />}>
              <Route index element={<UnifiedFeed />} />
              <Route path="popular" element={<PopularFeed />} />
              <Route path="discover" element={<ChannelDiscover />} />
              <Route path="channel/:slug" element={<ChannelFeed />} />
              <Route path="channel/:slug/admin" element={<ChannelAdmin />} />
              <Route path="channel/:slug/mod-queue" element={<ModQueue />} />
              <Route path="post/:postId" element={<PostDetail />} />
              <Route path="channel/:slug/room/:roomId" element={<StudyRoomNode />} />
            </Route>
            {/* Legacy Community Routes - Keep for backward compatibility */}
            <Route path="community-old" element={<CommunityHome />} />
          </Route>

          {/* --- Dedicated Admin Dashboard --- */}
          <Route element={<RoleRoute allowedRoles={['admin']} />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<UserManagement />} />
              <Route path="/admin/users/:userId" element={<UserProfileView />} />
              <Route path="/admin/content" element={<AdminContent />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>

        {/* AI Chat Widget - Disabled */}
        {/* <AIChat /> */}
      </Suspense>
      <PerformanceOverlay />
    </>
  );
};

export default App;