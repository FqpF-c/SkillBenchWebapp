import React from 'react';
import { LogOut, Settings, Shield, HelpCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Card from '../common/Card';
import Button from '../common/Button';

const SettingsCard = () => {
  const { signOut } = useAuth();

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to log out?')) {
      try {
        console.log('=== Starting Logout Process ===');
        const result = await signOut();
        console.log('Logout result:', result);
        
        if (result.success) {
          console.log('Successfully logged out');
          // The AuthContext will handle the state change automatically
          // The ProtectedRoute component will redirect to login
        } else {
          console.error('Logout failed:', result.error);
          alert(`Error signing out: ${result.error}`);
        }
      } catch (error) {
        console.error('Error signing out:', error);
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
    <div className="space-y-4 pb-8">
      <Card>
        <h3 className="font-semibold text-primary mb-4">Settings</h3>
        <div className="space-y-3">
          {settingsItems.map((item, index) => (
            <button
              key={index}
              onClick={item.onClick}
              className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <item.icon className="text-secondary" size={20} />
              <span className="text-primary font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </Card>

      <div className="flex justify-center">
        <Button
          variant="outline"
          onClick={handleLogout}
          className="px-8 border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400"
        >
          <LogOut size={16} />
          Log Out
        </Button>
      </div>
    </div>
  );
};

export default SettingsCard;