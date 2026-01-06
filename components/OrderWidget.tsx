
import React from 'react';
// Corrected import name to match exported constant in constants.tsx
import { MARKET_BOOK } from '../constants';

export const OrderWidget: React.FC = () => {
  return (
    <div className="card-dark p-8 rounded-[40px] space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-white">Sell Order</h3>
        <button className="text-slate-500"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg></button>
      </div>
      
      <div className="space-y-4">
        <div className="grid grid-cols-3 text-[10px] uppercase font-bold text-slate-600 tracking-widest">
          <span>Price</span>
          <span className="text-center">Amount</span>
          <span className="text-right">Total</span>
        </div>
        
        {/* Updated from MOCK_ORDERS to MARKET_BOOK */}
        {MARKET_BOOK.map((order, idx) => (
          <div 
            key={idx} 
            className={`grid grid-cols-3 items-center py-2.5 px-4 -mx-4 rounded-full transition-all ${order.highlight ? 'bg-teal-500 text-white font-bold' : 'text-slate-400 font-medium'}`}
          >
            <span className="text-xs">{order.price.toFixed(2)}</span>
            <span className="text-xs text-center">{order.amount}</span>
            <span className={`text-xs text-right ${order.highlight ? 'text-white' : 'text-slate-300'}`}>${order.total.toFixed(2)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
