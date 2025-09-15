import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Layout from './components/common/Layout'
import ProtectedRoute from './components/auth/ProtectedRoute'
import Login from './pages/Login'
import Register from './pages/Register'
import Home from './pages/Home'
import Academics from './pages/Academics'
import Leaderboard from './pages/Leaderboard'
import Profile from './pages/Profile'
import ListTopicsScreen from './pages/ListTopicsScreen'
import QuizLoadingScreen from './pages/QuizLoadingScreen'
import PracticeModeScreen from './pages/InfinitePracticeMode'
import TestModeScreen from './pages/TestModeScreen'
import QuizResultScreen from './pages/QuizResultScreen'
import { AppProvider } from './context/AppContext'
import { AuthProvider } from './context/AuthContext'

function App() {
  return (
    <AuthProvider>
      <AppProvider>
          <Router>
          <div className="min-h-screen bg-background">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/*" element={
                <ProtectedRoute>
                  <Layout>
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/academics" element={<Academics />} />
                      <Route path="/leaderboard" element={<Leaderboard />} />
                      <Route path="/profile" element={<Profile />} />
                      <Route path="/list-topics/:categoryId" element={<ListTopicsScreen />} />
                      <Route path="/quiz-loading" element={<QuizLoadingScreen />} />
                      <Route path="/practice-mode" element={<PracticeModeScreen />} />
                      <Route path="/test-mode" element={<TestModeScreen />} />
                      <Route path="/quiz-result" element={<QuizResultScreen />} />
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