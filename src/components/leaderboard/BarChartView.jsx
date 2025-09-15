import React from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell } from 'recharts';
import { Crown, Medal, Award, Zap } from 'lucide-react';

const BarChartView = ({ topUsers = [], timeframe = 'monthly', onTimeframeChange, isLoading = false }) => {
  // Prepare data for the bar chart - take first 10 users for better display
  const chartData = topUsers.slice(0, 10).map((user, index) => ({
    name: user.username || 'Anonymous',
    xp: user.xp || 0,
    rank: user.rank || index + 1,
    fullName: user.username || 'Anonymous',
    college: user.college || ''
  }));

  // Color scheme for different ranks
  const getBarColor = (rank) => {
    switch (rank) {
      case 1: return '#FFD700'; // Gold
      case 2: return '#C0C0C0'; // Silver  
      case 3: return '#CD7F32'; // Bronze
      default: return '#8B5CF6'; // Purple for others
    }
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1: return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2: return <Medal className="w-5 h-5 text-gray-500" />;
      case 3: return <Award className="w-5 h-5 text-orange-600" />;
      default: return null;
    }
  };

  // Custom label component to show XP values on top of bars
  const CustomLabel = (props) => {
    const { x, y, width, value, payload } = props;
    const rank = payload?.rank || 0;
    
    return (
      <g>
        {/* XP Value */}
        <text 
          x={x + width / 2} 
          y={y - 8} 
          fill="#374151" 
          textAnchor="middle" 
          fontSize="14" 
          fontWeight="600"
          className="drop-shadow-sm"
        >
          {value} XP
        </text>
        
        {/* Rank Icon for top 3 */}
        {rank <= 3 && (
          <foreignObject 
            x={x + width / 2 - 12} 
            y={y - 35} 
            width="24" 
            height="24"
          >
            <div className="flex justify-center items-center w-full h-full">
              {getRankIcon(rank)}
            </div>
          </foreignObject>
        )}
      </g>
    );
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white/95 backdrop-blur-sm p-4 rounded-xl shadow-xl border border-gray-200/60">
          <div className="flex items-center gap-2 mb-2">
            {getRankIcon(data.rank)}
            <span className="font-bold text-gray-900">#{data.rank} {data.fullName}</span>
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <Zap className="w-4 h-4 text-purple-500" />
            <span>{data.xp} XP</span>
          </div>
          {data.college && (
            <p className="text-xs text-gray-500 mt-1">{data.college}</p>
          )}
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="w-full bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200/60 p-8">
        <div className="animate-pulse">
          <div className="h-64 bg-gray-200 rounded-xl mb-4"></div>
          <div className="grid grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!chartData.length) {
    return (
      <div className="w-full bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200/60 p-8">
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BarChart className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No Data Available</h3>
          <p className="text-gray-500">No users found for the selected timeframe</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="w-full bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200/60 p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 40, right: 30, left: 20, bottom: 5 }}
            barCategoryGap="20%"
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" opacity={0.6} />
            <XAxis 
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#6B7280' }}
              interval={0}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#6B7280' }}
              label={{ value: 'Experience Points (XP)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#6B7280', fontSize: '12px' } }}
            />
            <Bar 
              dataKey="xp" 
              radius={[8, 8, 0, 0]}
              label={<CustomLabel />}
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={getBarColor(entry.rank)}
                  style={{
                    filter: entry.rank <= 3 ? 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))' : 'none'
                  }}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend for top 3 */}
      <div className="flex justify-center items-center gap-6 mt-4 pt-4 border-t border-gray-200/60">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-400 rounded"></div>
          <span className="text-sm text-gray-600 flex items-center gap-1">
            <Crown className="w-4 h-4 text-yellow-500" />
            1st Place
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-400 rounded"></div>
          <span className="text-sm text-gray-600 flex items-center gap-1">
            <Medal className="w-4 h-4 text-gray-500" />
            2nd Place
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-orange-600 rounded"></div>
          <span className="text-sm text-gray-600 flex items-center gap-1">
            <Award className="w-4 h-4 text-orange-600" />
            3rd Place
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default BarChartView;