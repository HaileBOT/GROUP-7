import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContextNew';

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { currentUser, userData } = useAuth();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  // Check if user is approved (for mentors)
  if (userData.role === 'mentor' && !userData.approved) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Mentor Application Pending</h2>
          <p className="text-dark-400">
            Your mentor application is being reviewed. You'll be notified once approved.
          </p>
        </div>
      </div>
    );
  }

  // Check required role
  if (requiredRole && userData.role !== requiredRole) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;