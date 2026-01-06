
import React from 'react';

export const SPELLS = [
  { id: 1, name: 'Nightshade Bishop', cost: 4, type: 'Tactical', image: 'https://picsum.photos/seed/spell1/200/200' },
  { id: 2, name: 'Aetheric Shield', cost: 5, type: 'Defense', image: 'https://picsum.photos/seed/spell2/200/200' },
  { id: 3, name: 'Void Strike', cost: 1, type: 'Attack', image: 'https://picsum.photos/seed/spell3/200/200' },
];

export const ANICHESS_MOCK_HISTORY = [
  { date: '2024-05-13', value: 120 },
  { date: '2024-05-14', value: 155 },
  { date: '2024-05-15', value: 210 },
  { date: '2024-05-16', value: 180 },
  { date: '2024-05-17', value: 240 },
  { date: '2024-05-18', value: 320 },
  { date: '2024-05-19', value: 315 },
];

export const ANICHESS_ACTIVITIES = [
  { id: 1, type: 'Arena Victory', asset: 'CHECK', amount: '+300', time: '12m ago', status: 'Completed', iconType: 'up' },
  { id: 2, type: 'Ethernal Mint', asset: 'Ethernal', amount: '#9912', time: '1h ago', status: 'Completed', iconType: 'down' },
  { id: 3, type: 'Market Buy', asset: 'CHECK', amount: '1,200', time: '4h ago', status: 'Completed', iconType: 'down' },
];

// Added MARKET_BOOK export to resolve import error in OrderWidget.tsx
export const MARKET_BOOK = [
  { price: 0.895, amount: '12,400', total: 11098.00, highlight: false },
  { price: 0.893, amount: '8,210', total: 7331.53, highlight: false },
  { price: 0.892, amount: '1,500', total: 1338.00, highlight: true },
  { price: 0.890, amount: '22,000', total: 19580.00, highlight: false },
  { price: 0.888, amount: '5,600', total: 4972.80, highlight: false },
];

export const ICONS = {
  CHECK: (
    <div className="w-8 h-8 bg-cyan-400 rounded-full flex items-center justify-center font-black text-black text-[10px]">
      CK
    </div>
  ),
  RON: (
    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center font-bold text-white text-[10px]">
      RON
    </div>
  ),
  ETH: (
    <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center font-bold text-white text-[10px]">
      ETH
    </div>
  ),
};
