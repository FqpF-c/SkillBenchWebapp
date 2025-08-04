import React from 'react';
import ProfileHeader from '../components/profile/ProfileHeader';
import ProfileInfo from '../components/profile/ProfileInfo';
import SettingsCard from '../components/profile/SettingsCard';

const Profile = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
      <div className="md:col-span-1 flex flex-col gap-6">
        <ProfileHeader />
        <ProfileInfo />
      </div>
      <div className="md:col-span-2 flex flex-col gap-6">
        <SettingsCard />
      </div>
    </div>
  );
};

export default Profile;