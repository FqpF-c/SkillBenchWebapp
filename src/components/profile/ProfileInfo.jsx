import React from 'react';
import { Phone, GraduationCap, Building, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Card from '../common/Card';

const ProfileInfo = () => {
  const { user } = useAuth();

  const userInfo = [
    {
      label: 'Phone Number',
      value: user?.phone || '+911234567890',
      icon: Phone
    },
    {
      label: 'College',
      value: user?.college || 'Sri Manakula Vinayagar Engineering College',
      icon: GraduationCap
    },
    {
      label: 'Department',
      value: user?.department || 'Mechatronics Engineering',
      icon: Building
    },
    {
      label: 'Batch',
      value: user?.batch || '2023-27',
      icon: Users
    }
  ];

  return (
    <div className="space-y-6">
      {/* Name and Email */}
      <div className="text-center pt-16">
        <h1 className="text-3xl font-bold text-primary mb-2">
          {user?.username || 'Tester'}
        </h1>
        <p className="text-gray-600">
          {user?.email || 'afasdasda@smvec.ac.in'}
        </p>
      </div>

      {/* User Info Cards */}
      <div className="space-y-4">
        {userInfo.map((info, index) => (
          <InfoCard key={index} {...info} />
        ))}
      </div>

      {/* Email Verification */}
      <Card className="border-l-4 border-l-orange-500">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-primary">Email Verification</h3>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-red-500 text-xs">✕</span>
              </div>
              <span className="text-sm font-medium text-primary">Not yet Verified</span>
            </div>
          </div>
          <p className="text-sm text-gray-600">
            You will be approved once our faculty reviews it, usually within a week!
          </p>
        </div>
      </Card>
    </div>
  );
};

const InfoCard = ({ label, value, icon: Icon }) => (
  <Card className="p-4">
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 bg-accent-light rounded-lg flex items-center justify-center">
        <Icon className="text-secondary" size={20} />
      </div>
      <div className="flex-1">
        <p className="text-sm text-gray-500 mb-1">{label}</p>
        <p className="font-medium text-primary">{value}</p>
      </div>
    </div>
  </Card>
);

export default ProfileInfo;