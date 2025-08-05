import React from 'react';
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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
      <div className="md:col-span-1 flex flex-col gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">{user?.username || 'User'}</h2>
            <p className="text-gray-500 text-sm">{user?.email || 'No email provided'}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Profile Information</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium text-gray-900">{user?.email || 'Not provided'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <School className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">College</p>
                <p className="font-medium text-gray-900">{user?.college || 'Not provided'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Department</p>
                <p className="font-medium text-gray-900">{user?.department || 'Not provided'}</p>
              </div>
            </div>
            {user?.batch && (
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Batch</p>
                  <p className="font-medium text-gray-900">{user.batch}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="md:col-span-2 flex flex-col gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Statistics</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-purple-50 rounded-xl">
              <p className="text-2xl font-bold text-purple-600">{user?.coins || 0}</p>
              <p className="text-sm text-gray-600">Coins</p>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-xl">
              <p className="text-2xl font-bold text-yellow-600">{user?.streaks || 0}</p>
              <p className="text-sm text-gray-600">Streaks</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-xl">
              <p className="text-2xl font-bold text-green-600">{user?.xp || 0}</p>
              <p className="text-sm text-gray-600">XP Points</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Settings</h3>
          <div className="space-y-3">
            {settingsItems.map((item, index) => (
              <button
                key={index}
                onClick={item.onClick}
                className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <item.icon className="text-gray-400" size={20} />
                <span className="text-gray-900 font-medium">{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-center">
          <button
            onClick={handleLogout}
            className="px-8 py-3 border border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 rounded-xl font-medium transition-colors flex items-center gap-2"
          >
            <LogOut size={16} />
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;