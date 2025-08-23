'use client';

import { useState } from 'react';
import { Search, Plus, AlertCircle, FileText, TrendingUp, Minus, Circle } from 'lucide-react';
import HoldingsModal from './HoldingsModal';

interface Holding {
  ticker: string;
  name: string;
  weight: number;
  currentPrice: number;
  change: number;
  changePercent: number;
  status: 'alert' | 'filing' | 'positive' | 'neutral';
  sector: string;
}

export default function Holdings() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const holdings: Holding[] = [
    { ticker: 'AAPL', name: 'Apple Inc.', weight: 15.2, currentPrice: 175.43, change: -2.15, changePercent: -1.21, status: 'filing', sector: 'Technology' },
    { ticker: 'MSFT', name: 'Microsoft Corp.', weight: 12.8, currentPrice: 338.11, change: 1.23, changePercent: 0.37, status: 'positive', sector: 'Technology' },
    { ticker: 'GOOGL', name: 'Alphabet Inc.', weight: 10.5, currentPrice: 142.56, change: -0.89, changePercent: -0.62, status: 'neutral', sector: 'Technology' },
    { ticker: 'AMZN', name: 'Amazon.com Inc.', weight: 9.3, currentPrice: 128.45, change: 2.34, changePercent: 1.86, status: 'positive', sector: 'Consumer Discretionary' },
    { ticker: 'TSLA', name: 'Tesla Inc.', weight: 8.7, currentPrice: 245.67, change: -5.23, changePercent: -2.08, status: 'alert', sector: 'Consumer Discretionary' },
    { ticker: 'NVDA', name: 'NVIDIA Corp.', weight: 7.9, currentPrice: 456.78, change: 12.45, changePercent: 2.81, status: 'positive', sector: 'Technology' },
    { ticker: 'JPM', name: 'JPMorgan Chase', weight: 6.4, currentPrice: 145.23, change: -1.12, changePercent: -0.76, status: 'neutral', sector: 'Financial Services' },
    { ticker: 'JNJ', name: 'Johnson & Johnson', weight: 5.8, currentPrice: 167.89, change: 0.45, changePercent: 0.27, status: 'neutral', sector: 'Healthcare' },
  ];

  const filteredHoldings = holdings.filter(holding =>
    holding.ticker.toLowerCase().includes(searchTerm.toLowerCase()) ||
    holding.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'alert':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'filing':
        return <FileText className="w-4 h-4 text-yellow-500" />;
      case 'positive':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      default:
        return <Circle className="w-4 h-4 text-slate-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'alert':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'filing':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'positive':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-900/20 dark:text-slate-400';
    }
  };

  return (
    <>
      <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200/50 dark:border-slate-700/50 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            Holdings
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
            placeholder="Search holdings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Holdings List */}
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {filteredHoldings.map((holding) => (
            <div
              key={holding.ticker}
              className="flex items-center justify-between p-3 bg-slate-50/50 dark:bg-slate-700/50 rounded-lg border border-slate-200/50 dark:border-slate-600/50 hover:bg-slate-100/50 dark:hover:bg-slate-600/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  {getStatusIcon(holding.status)}
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white">
                      {holding.ticker}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      {holding.name}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="font-semibold text-slate-900 dark:text-white">
                  ${holding.currentPrice.toFixed(2)}
                </div>
                <div className={`text-sm ${
                  holding.change >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {holding.change >= 0 ? '+' : ''}{holding.change.toFixed(2)} ({holding.changePercent.toFixed(2)}%)
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  {holding.weight.toFixed(1)}%
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredHoldings.length === 0 && (
          <div className="text-center py-8 text-slate-500 dark:text-slate-400">
            No holdings found matching "{searchTerm}"
          </div>
        )}
      </div>

      <HoldingsModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
