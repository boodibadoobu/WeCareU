import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import StudentDashboard from './pages/StudentDashboard';
import CounselorDashboard from './pages/CounselorDashboard';
import MySessionsPage from './pages/MySessionsPage';
import ChatPage from './pages/ChatPage';
import VideoCallPage from './pages/VideoCallPage';
import AnonChatPage from './pages/AnonChatPage';
import StressTestPage from './pages/StressTestPage';
import ArticleListPage from './pages/ArticleListPage';
import ArticleDetailPage from './pages/ArticleDetailPage';
import ArticleFormPage from './pages/ArticleFormPage';
import CounselorStudentResultsPage from './pages/CounselorStudentResultsPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import NotificationsPage from './pages/NotificationsPage';
import AdminUsersPage from './pages/AdminUsersPage';
import CounselorAnonChatsPage from './pages/CounselorAnonChatsPage';
import StudentAnonHistoryPage from './pages/StudentAnonHistoryPage';

// Placeholder Dashboards for Admin
// const AdminDashboard = () => <div className="p-8 text-2xl">Admin Dashboard - Coming Soon</div>;

const App = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/unauthorized" element={<div className="p-8 text-red-600">Unauthorized Access</div>} />

      {/* Protected Routes with Layout */}
      <Route element={<Layout />}>
        <Route
          path="/student"
          element={
            <ProtectedRoute allowedRoles={['STUDENT']}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/counselor"
          element={
            <ProtectedRoute allowedRoles={['COUNSELOR']}>
              <div className="p-8 text-2xl">Counselor Home - Use Sidebar</div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/counselor/requests"
          element={
            <ProtectedRoute allowedRoles={['COUNSELOR']}>
              <CounselorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/counselor/anon-chats"
          element={
            <ProtectedRoute allowedRoles={['COUNSELOR']}>
              <CounselorAnonChatsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminUsersPage />
            </ProtectedRoute>
          }
        />
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        <Route
          path="/sessions"
          element={
            <ProtectedRoute allowedRoles={['STUDENT', 'COUNSELOR']}>
              <MySessionsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chat/:id"
          element={
            <ProtectedRoute allowedRoles={['STUDENT', 'COUNSELOR']}>
              <ChatPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/video/:id"
          element={
            <ProtectedRoute allowedRoles={['STUDENT', 'COUNSELOR']}>
              <VideoCallPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/anon-chat"
          element={
            <ProtectedRoute allowedRoles={['STUDENT']}>
              <AnonChatPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/anon-chat/:id"
          element={
            <ProtectedRoute allowedRoles={['COUNSELOR', 'STUDENT']}>
              <AnonChatPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/stress-test"
          element={
            <ProtectedRoute allowedRoles={['STUDENT']}>
              <StressTestPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/anon-history"
          element={
            <ProtectedRoute allowedRoles={['STUDENT']}>
              <StudentAnonHistoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/articles"
          element={
            <ProtectedRoute allowedRoles={['STUDENT', 'COUNSELOR', 'ADMIN']}>
              <ArticleListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/articles/new"
          element={
            <ProtectedRoute allowedRoles={['COUNSELOR', 'ADMIN']}>
              <ArticleFormPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/articles/:id"
          element={
            <ProtectedRoute allowedRoles={['STUDENT', 'COUNSELOR', 'ADMIN']}>
              <ArticleDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/articles/:id/edit"
          element={
            <ProtectedRoute allowedRoles={['COUNSELOR', 'ADMIN']}>
              <ArticleFormPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute allowedRoles={['STUDENT', 'COUNSELOR', 'ADMIN']}>
              <NotificationsPage />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Default Redirect */}
      <Route path="/" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default App;
