'use client';

import { useState } from 'react';
import { Search, Plus, Eye, TrendingUp, TrendingDown, Circle } from 'lucide-react';
import WatchlistModal from './WatchlistModal';

interface WatchlistItem {
  ticker: string;
  name: string;
  currentPrice: number;
  change: number;
  changePercent: number;
  sector: string;
  addedDate: string;
}

export default function Watchlist() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const watchlistItems: WatchlistItem[] = [
    { ticker: 'COIN', name: 'Coinbase Global Inc.', currentPrice: 245.67, change: 8.45, changePercent: 3.56, sector: 'Financial Services', addedDate: '2024-01-15' },
    { ticker: 'SNOW', name: 'Snowflake Inc.', currentPrice: 178.90, change: -3.21, changePercent: -1.76, sector: 'Technology', addedDate: '2024-01-10' },
    { ticker: 'PLTR', name: 'Palantir Technologies', currentPrice: 23.45, change: 1.23, changePercent: 5.53, sector: 'Technology', addedDate: '2024-01-08' },
    { ticker: 'CRWD', name: 'CrowdStrike Holdings', currentPrice: 298.76, change: 12.34, changePercent: 4.31, sector: 'Technology', addedDate: '2024-01-05' },
    { ticker: 'ZM', name: 'Zoom Video Communications', currentPrice: 67.89, change: -2.45, changePercent: -3.48, sector: 'Technology', addedDate: '2024-01-03' },
    { ticker: 'UBER', name: 'Uber Technologies Inc.', currentPrice: 45.67, change: 0.89, changePercent: 1.99, sector: 'Technology', addedDate: '2024-01-01' },
  ];

  const filteredItems = watchlistItems.filter(item =>
    item.ticker.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <>
      <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200/50 dark:border-slate-700/50 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            Watchlist
          </h2>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search watchlist..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Watchlist Items */}
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {filteredItems.map((item) => (
            <div
              key={item.ticker}
              className="flex items-center justify-between p-3 bg-slate-50/50 dark:bg-slate-700/50 rounded-lg border border-slate-200/50 dark:border-slate-600/50 hover:bg-slate-100/50 dark:hover:bg-slate-600/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                  <Eye className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white">
                    {item.ticker}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    {item.name}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-500">
                    Added {formatDate(item.addedDate)}
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="font-semibold text-slate-900 dark:text-white">
                  ${item.currentPrice.toFixed(2)}
                </div>
                <div className={`text-sm ${
                  item.change >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {item.change >= 0 ? '+' : ''}{item.change.toFixed(2)} ({item.changePercent.toFixed(2)}%)
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-500">
                  {item.sector}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-8 text-slate-500 dark:text-slate-400">
            {searchTerm ? `No watchlist items found matching "${searchTerm}"` : 'No companies in your watchlist'}
          </div>
        )}
      </div>

      <WatchlistModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
