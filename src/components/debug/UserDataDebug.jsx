import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useUserData } from '../../hooks/useUserData';

const UserDataDebug = () => {
  const { user, loading: authLoading } = useAuth();
  const { userStats, userDetails, loading: userDataLoading, error } = useUserData();

  return (
    <div className="fixed top-4 right-4 bg-white p-4 rounded-lg shadow-lg border max-w-md z-50">
      <h3 className="font-bold text-lg mb-2">User Data Debug</h3>
      
      <div className="space-y-2 text-sm">
        <div>
          <strong>Auth Loading:</strong> {authLoading ? 'Yes' : 'No'}
        </div>
        
        <div>
          <strong>User Data Loading:</strong> {userDataLoading ? 'Yes' : 'No'}
        </div>
        
        <div>
          <strong>User:</strong> {user ? 'Present' : 'None'}
        </div>
        
        {user && (
          <div>
            <strong>User UID:</strong> {user.uid}
          </div>
        )}
        
        {user && user.phoneNumber && (
          <div>
            <strong>Phone Number:</strong> {user.phoneNumber}
          </div>
        )}
        
        <div>
          <strong>User Stats:</strong> {userStats ? 'Present' : 'None'}
        </div>
        
        {userStats && (
          <div className="pl-2">
            <div>XP: {userStats.xp}</div>
            <div>Coins: {userStats.coins}</div>
            <div>Streaks: {userStats.streaks}</div>
          </div>
        )}
        
        <div>
          <strong>User Details:</strong> {userDetails ? 'Present' : 'None'}
        </div>
        
        {userDetails && (
          <div className="pl-2">
            <div>Username: {userDetails.username}</div>
            <div>College: {userDetails.college}</div>
            <div>Department: {userDetails.department}</div>
          </div>
        )}
        
        {error && (
          <div className="text-red-600">
            <strong>Error:</strong> {error}
          </div>
        )}
      </div>
      
      <button 
        onClick={() => window.location.reload()}
        className="mt-2 px-3 py-1 bg-blue-500 text-white rounded text-xs"
      >
        Reload
      </button>
    </div>
  );
};

export default UserDataDebug; 