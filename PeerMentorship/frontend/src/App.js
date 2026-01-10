import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Context Providers
import { AuthProvider } from './context/AuthContextNew';

// Components
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import MentorListingPage from './pages/MentorListingPage';
import StudentListingPage from './pages/StudentListingPage';
import MentorReviewPage from './pages/MentorReviewPage';
import CourseListingPage from './pages/CourseListingPage';
import MessagesPage from './pages/MessagesPage';
import ChatPage from './pages/ChatPage';
import ProfilePage from './pages/ProfilePage';
import AskQuestionPage from './pages/AskQuestionPage';
import AdminDashboardPage from './pages/AdminDashboardPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#1e293b',
                color: '#fff',
                border: '1px solid #334155',
              },
            }}
          />
          
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            {/* Protected Routes */}
            <Route path="/admin" element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboardPage />
              </ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Layout>
                  <DashboardPage />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/mentors" element={
              <ProtectedRoute>
                <Layout>
                  <MentorListingPage />
                </Layout>
              </ProtectedRoute>
            } />

            <Route path="/students" element={
              <ProtectedRoute>
                <Layout>
                  <StudentListingPage />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/mentors/:mentorId" element={
              <ProtectedRoute>
                <Layout>
                  <MentorReviewPage />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/courses" element={
              <ProtectedRoute>
                <Layout>
                  <CourseListingPage />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/messages" element={
              <ProtectedRoute>
                <Layout>
                  <MessagesPage />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/chat/:sessionId" element={
              <ProtectedRoute>
                <Layout>
                  <ChatPage />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/profile" element={
              <ProtectedRoute>
                <Layout>
                  <ProfilePage />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/ask-question" element={
              <ProtectedRoute>
                <Layout>
                  <AskQuestionPage />
                </Layout>
              </ProtectedRoute>
            } />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;