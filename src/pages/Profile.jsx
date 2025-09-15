import React from 'react';
import { motion } from 'framer-motion';
import { User, Mail, School, Calendar, LogOut, Settings, Shield, HelpCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to log out?')) {
      try {
        console.log('=== Profile: Starting Logout Process ===');
        const result = await signOut();
        console.log('Profile: Logout result:', result);
        
        if (result.success) {
          console.log('Profile: Successfully logged out');
        } else {
          console.error('Profile: Logout failed:', result.error);
          alert(`Error signing out: ${result.error}`);
        }
      } catch (error) {
        console.error('Profile: Error signing out:', error);
        alert(`Error signing out: ${error.message}`);
      }
    }
  };

  const settingsItems = [
    { icon: Settings, label: 'Settings', onClick: () => console.log('Settings') },
    { icon: Shield, label: 'Privacy Policy', onClick: () => console.log('Privacy') },
    { icon: HelpCircle, label: 'Help & Support', onClick: () => console.log('Help') },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50/40 via-white to-pink-50/25 pt-16 sm:pt-20">
      <motion.div 
        className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8 py-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <motion.div 
            className="md:col-span-1 flex flex-col gap-6"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <motion.div 
              className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200/60 p-6 hover:shadow-xl hover:bg-white/90 transition-all duration-300 hover:-translate-y-1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="text-center">
                <motion.div 
                  className="w-24 h-24 bg-gradient-to-br from-purple-500 via-purple-600 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ duration: 0.8, delay: 0.8, type: "spring", stiffness: 150 }}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  <User className="w-12 h-12 text-white drop-shadow-lg" />
                </motion.div>
                <motion.h2 
                  className="text-xl font-bold text-gray-900 mb-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 1.0 }}
                >
                  {user?.username || 'User'}
                </motion.h2>
                <motion.p 
                  className="text-gray-600 text-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 1.1 }}
                >
                  {user?.email || 'No email provided'}
                </motion.p>
              </div>
            </motion.div>

            <motion.div 
              className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200/60 p-6 hover:shadow-xl hover:bg-white/90 transition-all duration-300 hover:-translate-y-1"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              whileHover={{ scale: 1.02 }}
            >
              <h3 className="font-semibold text-gray-900 mb-4">Profile Information</h3>
              <div className="space-y-4">
                {[
                  { icon: Mail, label: 'Email', value: user?.email || 'Not provided' },
                  { icon: School, label: 'College', value: user?.college || 'Not provided' },
                  { icon: Calendar, label: 'Department', value: user?.department || 'Not provided' },
                  ...(user?.batch ? [{ icon: Calendar, label: 'Batch', value: user.batch }] : [])
                ].map((item, index) => (
                  <motion.div 
                    key={index}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50/50 transition-colors duration-200"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 1.2 + index * 0.1 }}
                    whileHover={{ x: 5 }}
                  >
                    <item.icon className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">{item.label}</p>
                      <p className="font-medium text-gray-900">{item.value}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>

          <motion.div 
            className="md:col-span-2 flex flex-col gap-6"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <motion.div 
              className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200/60 p-6 hover:shadow-xl hover:bg-white/90 transition-all duration-300 hover:-translate-y-1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              whileHover={{ scale: 1.02 }}
            >
              <h3 className="font-semibold text-gray-900 mb-4">Statistics</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { label: 'Coins', value: user?.coins || 0, bg: 'from-purple-50 to-pink-50', color: 'text-purple-600' },
                  { label: 'Streaks', value: user?.streaks || 0, bg: 'from-pink-50 to-rose-50', color: 'text-pink-600' },
                  { label: 'XP Points', value: user?.xp || 0, bg: 'from-amber-50 to-yellow-50', color: 'text-amber-600' }
                ].map((stat, index) => (
                  <motion.div 
                    key={index}
                    className={`text-center p-4 bg-gradient-to-br ${stat.bg} rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100/50`}
                    initial={{ opacity: 0, y: 30, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ 
                      duration: 0.6, 
                      delay: 0.8 + index * 0.1,
                      type: "spring",
                      stiffness: 150
                    }}
                    whileHover={{ 
                      scale: 1.05, 
                      y: -5,
                      transition: { duration: 0.2 }
                    }}
                  >
                    <motion.p 
                      className={`text-2xl font-bold ${stat.color}`}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.5, delay: 1.0 + index * 0.1, type: "spring" }}
                    >
                      {stat.value}
                    </motion.p>
                    <p className="text-sm text-gray-600 font-medium">{stat.label}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div 
              className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200/60 p-6 hover:shadow-xl hover:bg-white/90 transition-all duration-300 hover:-translate-y-1"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              whileHover={{ scale: 1.02 }}
            >
              <h3 className="font-semibold text-gray-900 mb-4">Settings</h3>
              <div className="space-y-3">
                {settingsItems.map((item, index) => (
                  <motion.button
                    key={index}
                    onClick={item.onClick}
                    className="w-full flex items-center gap-3 p-3 hover:bg-purple-50/50 rounded-lg transition-all duration-200 group"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 1.0 + index * 0.1 }}
                    whileHover={{ 
                      x: 5,
                      scale: 1.02,
                      transition: { duration: 0.2 }
                    }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <item.icon className="text-gray-500 group-hover:text-purple-600 transition-colors duration-200" size={20} />
                    <span className="text-gray-900 font-medium group-hover:text-purple-700 transition-colors duration-200">{item.label}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>

            <motion.div 
              className="flex justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.2 }}
            >
              <motion.button
                onClick={handleLogout}
                className="px-8 py-3 border-2 border-purple-500 text-purple-600 hover:bg-purple-50 hover:border-purple-600 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 shadow-sm hover:shadow-lg group"
                whileHover={{ 
                  scale: 1.05,
                  y: -2,
                  transition: { duration: 0.2 }
                }}
                whileTap={{ scale: 0.95 }}
              >
                <LogOut className="group-hover:rotate-12 transition-transform duration-300" size={16} />
                Log Out
              </motion.button>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Profile;