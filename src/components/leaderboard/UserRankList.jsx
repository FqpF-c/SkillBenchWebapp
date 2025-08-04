import React from 'react';
import { Star } from 'lucide-react';
import Card from '../common/Card';

const UserRankList = () => {
  const users = [
    { rank: 4, name: 'John Doe', college: 'Tech University', points: 450 },
    { rank: 5, name: 'Jane Smith', college: 'Engineering College', points: 420 },
    { rank: 6, name: 'Mike Johnson', college: 'Science Institute', points: 380 },
    { rank: 7, name: 'Sarah Wilson', college: 'Tech University', points: 350 },
  ];

  return (
    <div className="space-y-4 pb-8">
      <div className="flex items-center justify-center gap-4 mb-4">
        <div className="w-10 h-0.5 bg-gray-200" />
        <span className="text-gray-500 text-sm font-medium">Other Rankings</span>
        <div className="w-10 h-0.5 bg-gray-200" />
      </div>

      {users.map((user, index) => (
        <Card key={index} className="bg-white border border-gray-100">
          <div className="flex items-center gap-4">
            {/* Rank */}
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
              <span className="text-primary font-bold">{user.rank}</span>
            </div>

            {/* Avatar */}
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
              <span className="text-primary font-medium">
                {user.name.split(' ').map(n => n.charAt(0)).join('')}
              </span>
            </div>

            {/* User Info */}
            <div className="flex-1">
              <h3 className="text-gray-800 font-semibold">{user.name}</h3>
              <p className="text-gray-500 text-sm">{user.college}</p>
            </div>

            {/* Points */}
            <div className="text-right">
              <div className="flex items-center gap-1 bg-yellow-100 px-3 py-1 rounded-full">
                <Star className="text-yellow-500" size={14} />
                <span className="text-gray-800 font-bold text-sm">{user.points}</span>
              </div>
              <span className="text-gray-500 text-xs">points</span>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default UserRankList;