import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Layout from './components/common/Layout'
import Home from './pages/Home'
import Academics from './pages/Academics'
import Leaderboard from './pages/Leaderboard'
import Profile from './pages/Profile'
import ListTopicsScreen from './pages/ListTopicsScreen'
import { AppProvider } from './context/AppContext'
import { AuthProvider } from './context/AuthContext'

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <Router>
          <div className="min-h-screen bg-background">
            <Layout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/academics" element={<Academics />} />
                <Route path="/leaderboard" element={<Leaderboard />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/list-topics/:categoryId" element={<ListTopicsScreen />} />
              </Routes>
            </Layout>
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