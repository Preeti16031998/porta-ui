'use client';

import { useState, useEffect, useCallback, useImperativeHandle, forwardRef } from 'react';
import { TrendingUp, TrendingDown, BarChart3, RefreshCw, User, Clock, Target, Activity } from 'lucide-react';
import { useUserId } from '@/hooks/useUser';

export interface PortfolioSummaryRef {
  refresh: () => Promise<void>;
}

interface PortfolioSummaryData {
  total_value: string;
  total_cost: string;
  total_return: string;
  total_return_percentage: string;
  total_positions: number;
  profitable_positions: number;
  market_status: string;
  last_updated: string;
}

const PortfolioSummary = forwardRef<PortfolioSummaryRef>((props, ref) => {
  const [data, setData] = useState<PortfolioSummaryData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState<string>('');

  const userId = useUserId();

  // Set time on client side only to avoid hydration mismatch
  useEffect(() => {
    setCurrentTime(new Date().toLocaleTimeString());
    
    // Update time every minute
    const interval = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);

  // Debug logging
  useEffect(() => {
    console.log('PortfolioSummary component - userId:', userId);
    console.log('PortfolioSummary component - current state:', { data, loading, error });
  }, [userId, data, loading, error]);

  // Stable API call function
  const fetchPortfolioSummary = useCallback(async () => {
    if (!userId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching portfolio summary for user:', userId);
      
      const response = await fetch(`http://localhost:8000/api/v1/portfolio/summary/total/${userId}`);
      
      console.log('Portfolio summary API response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const summaryData: PortfolioSummaryData = await response.json();
      console.log('Portfolio summary data:', summaryData);
      
      setData(summaryData);
    } catch (err) {
      console.error('Portfolio summary fetch error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Expose refresh function to parent components
  useImperativeHandle(ref, () => ({
    refresh: fetchPortfolioSummary
  }), [fetchPortfolioSummary]);

  // Fetch data when component mounts or userId changes
  useEffect(() => {
    if (userId) {
      fetchPortfolioSummary();
    }
  }, [userId, fetchPortfolioSummary]);

  const formatCurrency = useCallback((value: string | number) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  }, []);

  const formatPercent = useCallback((value: string | number) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return `${num >= 0 ? '+' : ''}${num.toFixed(1)}%`;
  }, []);

  const formatDate = useCallback((dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }, []);

  const getMarketStatusColor = useCallback((status: string) => {
    switch (status.toLowerCase()) {
      case 'open':
        return 'bg-green-500';
      case 'closed':
        return 'bg-red-500';
      case 'pre-market':
        return 'bg-yellow-500';
      case 'after-hours':
        return 'bg-blue-500';
      default:
        return 'bg-slate-500';
    }
  }, []);

  const getMarketStatusText = useCallback((status: string) => {
    switch (status.toLowerCase()) {
      case 'open':
        return 'Market Open';
      case 'closed':
        return 'Market Closed';
      case 'pre-market':
        return 'Pre-Market';
      case 'after-hours':
        return 'After Hours';
      default:
        return status;
    }
  }, []);

  if (loading && !data) {
    return (
      <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200/50 dark:border-slate-700/50 p-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading portfolio summary...</p>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200/50 dark:border-slate-700/50 p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium">Error Loading Portfolio Summary</h3>
          <p className="text-red-600 text-sm mt-1">{error}</p>
          <button
            onClick={fetchPortfolioSummary}
            className="mt-2 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200/50 dark:border-slate-700/50 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            Portfolio Summary
          </h2>
          {/* User ID Display */}
          {userId && (
            <div className="flex items-center gap-2 mt-1 text-sm text-slate-600 dark:text-slate-400">
              <User className="w-4 h-4" />
              <span className="font-mono text-xs">{userId}</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchPortfolioSummary}
            disabled={loading}
            className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
            title="Refresh Portfolio Summary"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
            <BarChart3 className="w-4 h-4" />
            <span>Live</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Portfolio Value */}
        <div className="text-center">
          <div className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            {formatCurrency(data.total_value)}
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400">
            Total Value
          </div>
        </div>

        {/* Total Cost */}
        <div className="text-center">
          <div className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            {formatCurrency(data.total_cost)}
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400">
            Total Cost
          </div>
        </div>

        {/* Total Return */}
        <div className="text-center">
          <div className={`text-3xl font-bold mb-2 flex items-center justify-center gap-2 ${
            parseFloat(data.total_return) >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {parseFloat(data.total_return) >= 0 ? (
              <TrendingUp className="w-5 h-5" />
            ) : (
              <TrendingDown className="w-5 h-5" />
            )}
            {formatCurrency(data.total_return)}
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400">
            Total Return ({formatPercent(data.total_return_percentage)})
          </div>
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
        {/* Positions Count */}
        <div className="text-center">
          <div className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
            {data.total_positions}
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400 flex items-center justify-center gap-1">
            <Activity className="w-3 h-3" />
            Total Positions
          </div>
        </div>

        {/* Profitable Positions */}
        <div className="text-center">
          <div className="text-lg font-semibold text-green-600 mb-1">
            {data.profitable_positions}
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400 flex items-center justify-center gap-1">
            <TrendingUp className="w-3 h-3" />
            Profitable
          </div>
        </div>
      </div>

      {/* Market Status */}
      <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full animate-pulse ${getMarketStatusColor(data.market_status)}`}></div>
            <span className="text-sm text-slate-600 dark:text-slate-400">
              {getMarketStatusText(data.market_status)}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
            <Clock className="w-3 h-3" />
            <span>Last updated: {formatDate(data.last_updated)}</span>
          </div>
        </div>
      </div>
    </div>
  );
});

export default PortfolioSummary;
