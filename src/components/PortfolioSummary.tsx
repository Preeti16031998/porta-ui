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
  console.log('PortfolioSummary component rendering...');
  const [data, setData] = useState<PortfolioSummaryData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState<string>('');

  const userId = useUserId();
  
  // Debug logging for userId
  console.log('PortfolioSummary - userId from hook:', userId);
  console.log('PortfolioSummary - fallback userId from env:', process.env.NEXT_PUBLIC_USER_ID);
  
  // Use fallback userId if hook doesn't work
  const effectiveUserId = userId || process.env.NEXT_PUBLIC_USER_ID || 'f00dc8bd-eabc-4143-b1f0-fbcb9715a02e';
  console.log('PortfolioSummary - effective userId:', effectiveUserId);

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
    if (!effectiveUserId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching portfolio summary for user:', effectiveUserId);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'}/api/v1/portfolio/?user_id=${effectiveUserId}&include_pnl=true`);
      
      console.log('Portfolio summary API response status:', response.status);
      
      if (response.ok) {
        const portfolioData = await response.json();
        console.log('Portfolio data:', portfolioData);
        
        // Calculate summary from portfolio data
        if (portfolioData.portfolios && portfolioData.portfolios.length > 0) {
          const portfolios = portfolioData.portfolios;
          
          // Calculate totals
          const totalValue = portfolios.reduce((sum: number, item: any) => {
            return sum + (parseFloat(item.current_value || '0') || 0);
          }, 0);
          
          const totalCost = portfolios.reduce((sum: number, item: any) => {
            return sum + (parseFloat(item.total_cost || '0') || 0);
          }, 0);
          
          const totalReturn = totalValue - totalCost;
          const totalReturnPercentage = totalCost > 0 ? (totalReturn / totalCost) * 100 : 0;
          
          const summaryData: PortfolioSummaryData = {
            total_value: totalValue.toString(),
            total_cost: totalCost.toString(),
            total_return: totalReturn.toString(),
            total_return_percentage: totalReturnPercentage.toString(),
            total_positions: portfolios.length,
            profitable_positions: portfolios.filter((item: any) => parseFloat(item.unrealized_pnl || '0') > 0).length,
            market_status: 'open', // Default to open for now
            last_updated: new Date().toISOString()
          };
          
          console.log('Calculated summary data:', summaryData);
          setData(summaryData);
        } else {
          // No portfolios found, set default data
          console.log('No portfolios found, setting default data');
          const defaultData: PortfolioSummaryData = {
            total_value: '0',
            total_cost: '0',
            total_return: '0',
            total_return_percentage: '0',
            total_positions: 0,
            profitable_positions: 0,
            market_status: 'open',
            last_updated: new Date().toISOString()
          };
          setData(defaultData);
        }
      } else if (response.status === 404) {
        // Handle 404 gracefully - portfolio doesn't exist yet, which is fine
        console.log('No existing portfolio found for user, starting with defaults');
        const defaultData: PortfolioSummaryData = {
          total_value: '0',
          total_cost: '0',
          total_return: '0',
          total_return_percentage: '0',
          total_positions: 0,
          profitable_positions: 0,
          market_status: 'open',
          last_updated: new Date().toISOString()
        };
        setData(defaultData);
      } else {
        // Only throw errors for non-404 status codes
        throw new Error(`HTTP error! status: ${response.status}`);
      }
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

  // Fetch data when component mounts or effectiveUserId changes
  useEffect(() => {
    if (effectiveUserId) {
      fetchPortfolioSummary();
    }
  }, [effectiveUserId, fetchPortfolioSummary]);

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
      <div className="bg-[#FCFCFC] backdrop-blur-sm rounded-3xl shadow-lg border border-slate-300/50 p-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading portfolio summary...</p>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="bg-[#FCFCFC] backdrop-blur-sm rounded-3xl shadow-lg border border-slate-300/50 p-6">
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
    return (
      <div className="bg-[#FCFCFC] rounded-3xl shadow-lg border border-slate-300/50 p-6">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-[#1B263B] tracking-tight">
            Portfolio Summary
          </h2>
        </div>
        <div className="text-center py-8 text-[#495057]">
          <p>Loading portfolio data...</p>
          <p className="text-sm mt-2">User ID: {effectiveUserId}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FCFCFC] rounded-3xl shadow-lg border border-slate-300/50 p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-lg font-bold text-[#1B263B] tracking-tight">
          Portfolio Summary
        </h2>
      </div>

      {/* Side by Side Layout */}
      <div className="flex items-start justify-between">
        {/* Left Side - Main Portfolio Value & Daily Change */}
        <div className="flex-1 pr-6">
          {/* Main Portfolio Value */}
          <div className="text-2xl font-semibold text-[#1B263B] mb-3 tracking-tight">
            {formatCurrency(data.total_value)}
          </div>

          {/* Daily Change */}
          <div className="flex items-center gap-3 mb-2">
            <span className={`text-base font-semibold ${
              parseFloat(data.total_return) >= 0 ? 'text-[#2EC4B6]' : 'text-[#E63946]'
            } tracking-tight`}>
              {parseFloat(data.total_return) >= 0 ? '+' : ''}{formatCurrency(data.total_return)}
            </span>
            <span className={`text-base font-semibold ${
              parseFloat(data.total_return_percentage) >= 0 ? 'text-[#2EC4B6]' : 'text-[#E63946]'
            } tracking-tight`}>
              ({formatPercent(data.total_return_percentage)})
            </span>
          </div>

          {/* Today Label */}
          <div className="text-sm text-[#495057] font-semibold tracking-wide">
            Today
          </div>
        </div>

        {/* Right Side - Additional Metrics */}
        <div className="text-right pl-6">
          {/* Total Cost */}
          <div className="text-xs text-[#495057] font-medium mb-1 tracking-wide uppercase">Total Cost</div>
          <div className="text-base font-semibold text-[#1B263B] mb-3 tracking-tight">
            {formatCurrency(data.total_cost)}
          </div>

          {/* Total Positions */}
          <div className="text-xs text-[#495057] font-medium mb-1 tracking-wide uppercase">Positions</div>
          <div className="text-base font-semibold text-[#1B263B] tracking-tight">
            {data.total_positions}
          </div>
        </div>
      </div>
    </div>
  );
});

export default PortfolioSummary;
