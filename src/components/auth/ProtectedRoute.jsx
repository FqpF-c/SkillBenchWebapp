import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Loading SkillBench</h2>
          <p className="text-gray-500">Please wait while we set things up...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    console.log('[PROTECTED_ROUTE] User not authenticated, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user has completed registration
  if (user && (!user.username || user.username === '' || !user.college || user.college === '')) {
    console.log('[PROTECTED_ROUTE] User missing registration data, redirecting to register:', { 
      username: user.username, 
      college: user.college,
      hasUsername: !!user.username,
      hasCollege: !!user.college,
      phoneNumber: user.phoneNumber
    });
    return <Navigate to="/register" replace />;
  }

  // User is authenticated and has completed registration
  console.log('[PROTECTED_ROUTE] User authenticated, allowing access:', user.username);
  return children;
};

export default ProtectedRoute;