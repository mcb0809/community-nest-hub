
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface XPLog {
  id: string;
  action_type: string;
  xp_earned: number;
  description: string | null;
  created_at: string;
}

interface XPLogChartProps {
  xpLogs: XPLog[];
}

const XPLogChart = ({ xpLogs }: XPLogChartProps) => {
  // Prepare data for chart - calculate cumulative XP
  const chartData = xpLogs
    .slice()
    .reverse() // Reverse to get chronological order
    .reduce((acc, log, index) => {
      const cumulativeXP = index === 0 ? log.xp_earned : acc[index - 1].cumulativeXP + log.xp_earned;
      acc.push({
        date: new Date(log.created_at).toLocaleDateString('vi-VN'),
        cumulativeXP,
        xpEarned: log.xp_earned,
        action: log.action_type,
      });
      return acc;
    }, [] as any[]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800 border border-slate-600 rounded-lg p-3 shadow-lg">
          <p className="text-white font-medium">{`Ngày: ${label}`}</p>
          <p className="text-purple-400">{`Tổng XP: ${payload[0].value.toLocaleString()}`}</p>
          {payload[0].payload.action && (
            <p className="text-slate-300 text-sm">{`Hành động: ${payload[0].payload.action}`}</p>
          )}
          {payload[0].payload.xpEarned && (
            <p className="text-green-400 text-sm">{`+${payload[0].payload.xpEarned} XP`}</p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="date" 
            stroke="#9CA3AF"
            fontSize={12}
          />
          <YAxis 
            stroke="#9CA3AF"
            fontSize={12}
            tickFormatter={(value) => value.toLocaleString()}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line 
            type="monotone" 
            dataKey="cumulativeXP" 
            stroke="#8B5CF6" 
            strokeWidth={2}
            dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: '#8B5CF6', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default XPLogChart;
