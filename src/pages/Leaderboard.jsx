import React from 'react';
import PodiumView from '../components/leaderboard/PodiumView';
import UserRankList from '../components/leaderboard/UserRankList';

const Leaderboard = () => {
  return (
    <div className="space-y-10 w-full">
      <PodiumView />
      <div className="bg-white rounded-2xl shadow-md p-6">
        <UserRankList />
      </div>
    </div>
  );
};

export default Leaderboard;