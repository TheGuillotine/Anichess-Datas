
import React from 'react';
import { Area, AreaChart, ResponsiveContainer, Tooltip } from 'recharts';

interface ChartProps {
  data: { date: string; value: number }[];
  sparkline?: boolean;
}

export const MarketChart: React.FC<ChartProps> = ({ data, sparkline = false }) => {
  // If no data, return nothing to avoid crashes
  if (!data || data.length === 0) return null;

  if (sparkline) {
    return (
      <div style={{ width: '100%', height: '100%', minHeight: '50px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="checkSparklineGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.4}/>
                <stop offset="100%" stopColor="#22d3ee" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke="#22d3ee" 
              strokeWidth={2} 
              fillOpacity={1} 
              fill="url(#checkSparklineGradient)"
              isAnimationActive={true}
              animationDuration={1000}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <div className="h-[240px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <Tooltip 
             contentStyle={{ backgroundColor: '#1c1e24', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px' }}
             itemStyle={{ color: '#0ea5e9', fontWeight: 800, fontSize: '12px' }}
             cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }}
          />
          <Area 
            type="monotone" 
            dataKey="value" 
            stroke="#0ea5e9" 
            strokeWidth={3} 
            fillOpacity={1} 
            fill="url(#colorVal)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
