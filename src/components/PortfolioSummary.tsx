'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';

interface PortfolioData {
  totalValue: number;
  dailyChange: number;
  dailyChangePercent: number;
  weeklyChange: number;
  weeklyChangePercent: number;
  totalReturn: number;
  totalReturnPercent: number;
}

export default function PortfolioSummary() {
  const [currentTime, setCurrentTime] = useState<string>('');

  // Set time on client side only to avoid hydration mismatch
  useEffect(() => {
    setCurrentTime(new Date().toLocaleTimeString());
    
    // Update time every minute
    const interval = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);

  const portfolioData: PortfolioData = {
    totalValue: 125000,
    dailyChange: 1250,
    dailyChangePercent: 1.01,
    weeklyChange: 3750,
    weeklyChangePercent: 3.08,
    totalReturn: 25000,
    totalReturnPercent: 25.0,
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  return (
    <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200/50 dark:border-slate-700/50 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
          Portfolio Summary
        </h2>
        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
          <BarChart3 className="w-4 h-4" />
          <span>Live</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Portfolio Value */}
        <div className="text-center">
          <div className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            {formatCurrency(portfolioData.totalValue)}
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400">
            Total Value
          </div>
        </div>

        {/* Daily Change */}
        <div className="text-center">
          <div className={`text-2xl font-semibold mb-2 flex items-center justify-center gap-2 ${
            portfolioData.dailyChange >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {portfolioData.dailyChange >= 0 ? (
              <TrendingUp className="w-5 h-5" />
            ) : (
              <TrendingDown className="w-5 h-5" />
            )}
            {formatCurrency(portfolioData.dailyChange)}
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400">
            Today ({formatPercent(portfolioData.dailyChangePercent)})
          </div>
        </div>

        {/* Weekly Change */}
        <div className="text-center">
          <div className={`text-2xl font-semibold mb-2 flex items-center justify-center gap-2 ${
            portfolioData.weeklyChange >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {portfolioData.weeklyChange >= 0 ? (
              <TrendingUp className="w-5 h-5" />
            ) : (
              <TrendingDown className="w-5 h-5" />
            )}
            {formatCurrency(portfolioData.weeklyChange)}
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400">
            This Week ({formatPercent(portfolioData.weeklyChangePercent)})
          </div>
        </div>

        {/* Total Return */}
        <div className="text-center">
          <div className="text-2xl font-semibold text-green-600 mb-2 flex items-center justify-center gap-2">
            <TrendingUp className="w-5 h-5" />
            {formatCurrency(portfolioData.totalReturn)}
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400">
            Total Return ({formatPercent(portfolioData.totalReturnPercent)})
          </div>
        </div>
      </div>

      {/* Market Status */}
      <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-slate-600 dark:text-slate-400">
              Market Open
            </span>
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400">
            Last updated: {currentTime || 'Loading...'}
          </div>
        </div>
      </div>
    </div>
  );
}
