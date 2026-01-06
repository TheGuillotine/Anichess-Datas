
import React from 'react';
import { AIInsight } from '../types';

interface AIInsightsPanelProps {
  insights: AIInsight[];
  loading: boolean;
}

export const AIInsightsPanel: React.FC<AIInsightsPanelProps> = ({ insights, loading }) => {
  if (loading) {
    return (
      <div className="card-glass p-6 rounded-2xl animate-pulse space-y-4">
        <div className="h-4 w-1/4 bg-slate-700 rounded" />
        <div className="h-20 w-full bg-slate-700/50 rounded" />
        <div className="h-20 w-full bg-slate-700/50 rounded" />
      </div>
    );
  }

  return (
    <div className="card-glass p-6 rounded-2xl">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
        <h3 className="font-semibold text-lg">Ronin Oracle Insights</h3>
      </div>
      <div className="space-y-6">
        {insights.map((insight, idx) => (
          <div key={idx} className="flex gap-4 group">
            <div className={`w-1 h-auto rounded-full shrink-0 ${
              insight.sentiment === 'positive' ? 'bg-green-500' :
              insight.sentiment === 'negative' ? 'bg-red-500' : 'bg-blue-500'
            }`} />
            <div>
              <h4 className="font-bold text-slate-200 group-hover:text-white transition-colors">
                {insight.title}
              </h4>
              <p className="text-sm text-slate-400 mt-1 leading-relaxed">
                {insight.content}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
