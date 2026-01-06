
import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  change?: number;
  prefix?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, change, prefix = "" }) => {
  const isPositive = change && change > 0;
  
  return (
    <div className="card-glass p-6 rounded-2xl flex flex-col justify-between hover:border-blue-500/50 transition-all">
      <p className="text-slate-400 text-sm font-medium">{label}</p>
      <div className="mt-2 flex items-baseline gap-2">
        <h3 className="text-3xl font-bold tracking-tight">
          {prefix}{typeof value === 'number' ? value.toLocaleString() : value}
        </h3>
        {change !== undefined && (
          <span className={`text-sm font-semibold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
            {isPositive ? '↑' : '↓'} {Math.abs(change)}%
          </span>
        )}
      </div>
    </div>
  );
};
