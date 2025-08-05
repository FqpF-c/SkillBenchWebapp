import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Layout from './components/common/Layout'
import Home from './pages/Home'
import Category from './pages/Category'
import Academics from './pages/Academics'
import Leaderboard from './pages/Leaderboard'
import Profile from './pages/Profile'
import TopicDetail from './pages/TopicDetail'
import LoginFlow from './components/auth/LoginFlow'
import { AppProvider } from './context/AppContext'
import { AuthProvider, useAuth } from './context/AuthContext'

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  console.log('ProtectedRoute - Auth state:', { isAuthenticated, loading });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log('User not authenticated, showing login flow');
    return <LoginFlow onLoginComplete={() => console.log('Login completed')} />;
  }

  console.log('User authenticated, showing protected content');
  return children;
};

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <Router>
          <div className="min-h-screen bg-background">
            <Routes>
              <Route path="/topic/:categoryId/:subcategoryName/:topicName" element={
                <ProtectedRoute>
                  <TopicDetail />
                </ProtectedRoute>
              } />
              <Route path="/*" element={
                <ProtectedRoute>
                  <Layout>
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/category/:categoryId" element={<Category />} />
                      <Route path="/academics" element={<Academics />} />
                      <Route path="/leaderboard" element={<Leaderboard />} />
                      <Route path="/profile" element={<Profile />} />
                    </Routes>
                  </Layout>
                </ProtectedRoute>
              } />
            </Routes>
            <Toaster 
              position="top-center"
              toastOptions={{
                duration: 3000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
              }}
            />
          </div>
        </Router>
      </AppProvider>
    </AuthProvider>
  )
}

export default App