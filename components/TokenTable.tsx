
import React from 'react';
import { TokenAsset } from '../types';
import { ICONS } from '../constants';

interface TokenTableProps {
  tokens: TokenAsset[];
}

export const TokenTable: React.FC<TokenTableProps> = ({ tokens }) => {
  return (
    <div className="card-glass rounded-2xl overflow-hidden">
      <div className="px-6 py-4 border-b border-white/5 bg-white/5">
        <h3 className="font-semibold text-lg">Assets</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="text-slate-400 text-xs uppercase bg-white/5">
            <tr>
              <th className="px-6 py-3">Token</th>
              <th className="px-6 py-3">Balance</th>
              <th className="px-6 py-3">Price</th>
              <th className="px-6 py-3">Value</th>
              <th className="px-6 py-3">24h</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {tokens.map((token) => (
              <tr key={token.symbol} className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-4 flex items-center gap-3">
                  {ICONS[token.symbol as keyof typeof ICONS] || <div className="w-8 h-8 bg-slate-700 rounded-full" />}
                  <div>
                    <div className="font-bold">{token.symbol}</div>
                    <div className="text-xs text-slate-500">{token.name}</div>
                  </div>
                </td>
                <td className="px-6 py-4 font-mono text-sm">{token.balance.toLocaleString()}</td>
                <td className="px-6 py-4 font-mono text-sm">${token.priceUsd.toFixed(2)}</td>
                <td className="px-6 py-4 font-mono font-semibold">${(token.balance * token.priceUsd).toLocaleString()}</td>
                <td className={`px-6 py-4 text-sm font-medium ${token.change24h > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {token.change24h}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
