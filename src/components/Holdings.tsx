'use client';

import { useState, useEffect, useCallback, useMemo, useImperativeHandle, forwardRef } from 'react';
import { Search, Plus, Edit, Trash2, RefreshCw, User, TrendingUp, TrendingDown } from 'lucide-react';
import HoldingsModal from './HoldingsModal';
import { useUserId } from '@/hooks/useUser';
import { PortfolioService, PortfolioItem } from '@/services/api';

export interface HoldingsRef {
  refresh: () => Promise<void>;
}

const Holdings = forwardRef<HoldingsRef>((props, ref) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<PortfolioItem | null>(null);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const userId = useUserId();

  // Debug logging
  useEffect(() => {
    console.log('Holdings component - userId:', userId);
    console.log('Holdings component - current state:', { data, loading, error, currentPage });
  }, [userId, data, loading, error, currentPage]);

  // Stable API call function
  const fetchHoldings = useCallback(async () => {
    if (!userId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching holdings for user:', userId, 'page:', currentPage);
      
      const response = await PortfolioService.getPortfolios({
        user_id: userId,
        page: currentPage,
        size: pageSize,
        include_pnl: true
      });
      
      console.log('Holdings API response:', response);
      
      if (response.success) {
        setData(response.data);
        console.log('Holdings data set:', response.data);
      } else {
        console.error('Holdings API error:', response.error);
        setError(response.error || 'Failed to fetch holdings');
      }
    } catch (err) {
      console.error('Holdings fetch error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [userId, currentPage]);

  // Expose refresh function to parent components
  useImperativeHandle(ref, () => ({
    refresh: fetchHoldings
  }), [fetchHoldings]);

  // Fetch data when component mounts or userId/currentPage changes
  useEffect(() => {
    if (userId) {
      fetchHoldings();
    }
  }, [userId, currentPage, fetchHoldings]);

  const handlePageChange = useCallback((newPage: number) => {
    setCurrentPage(newPage);
  }, []);

  const handleDelete = useCallback(async (id: string) => {
    if (confirm('Are you sure you want to remove this holding from your portfolio?')) {
      try {
        await PortfolioService.deletePortfolio(id);
        // Refresh the current page
        fetchHoldings();
      } catch (error) {
        console.error('Failed to delete portfolio item:', error);
        alert('Failed to delete item. Please try again.');
      }
    }
  }, [fetchHoldings]);

  const handleEdit = useCallback((item: PortfolioItem) => {
    setEditItem(item);
    setIsModalOpen(true);
  }, []);

  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
    setEditItem(null);
  }, []);

  const handleModalSuccess = useCallback(() => {
    fetchHoldings(); // Refresh the list
    handleModalClose();
  }, [fetchHoldings, handleModalClose]);

  const formatDate = useCallback((dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }, []);

  const formatCurrency = useCallback((value: string | number) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  }, []);

  const formatNumber = useCallback((value: string | number) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    }).format(num);
  }, []);

  // Memoized computed values
  const portfolioItems = useMemo(() => data?.portfolios || [], [data]);
  const totalPages = useMemo(() => data?.pages || 1, [data]);
  const totalItems = useMemo(() => data?.total || 0, [data]);

  // Filter holdings based on search term
  const filteredItems = useMemo(() => {
    if (!searchTerm.trim()) return portfolioItems;
    
    return portfolioItems.filter((item: PortfolioItem) =>
      item.ticker.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.note && item.note.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [portfolioItems, searchTerm]);

  return (
    <>
      <div className="bg-[#F1F3F4] rounded-xl shadow-lg border border-[#495057]/10 p-3 transition-shadow duration-300 hover:shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-[#1B263B] tracking-tight">
              Holdings
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchHoldings}
              disabled={loading}
              className="p-2 text-[#495057] hover:text-[#3A86FF] disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors hover:bg-white/50"
              title="Refresh Holdings"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="w-8 h-8 bg-[#1B263B] hover:bg-[#1B263B]/90 text-white rounded-full transition-colors flex items-center justify-center"
              title="Add Holding"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>



        {/* Loading State */}
        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3A86FF] mx-auto"></div>
            <p className="mt-2 text-[#495057]">Loading holdings...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-[#E63946]/10 border border-[#E63946]/20 rounded-lg p-4 mb-4">
            <h3 className="text-[#E63946] font-medium">Error Loading Holdings</h3>
            <p className="text-[#E63946] text-sm mt-1">{error}</p>
            <button
              onClick={fetchHoldings}
              className="mt-2 px-3 py-1 bg-[#E63946] text-white text-sm rounded hover:bg-[#E63946]/90"
            >
              Retry
            </button>
          </div>
        )}

        {/* Holdings List */}
        {!loading && !error && (
          <>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {filteredItems.map((item: PortfolioItem) => (
                <div
                  key={item.portfolio_id}
                  className="flex items-center justify-between p-2 bg-[#E9ECEF] rounded-lg border border-[#495057]/10 hover:bg-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-white/50">
                      <img 
                        src={`https://eodhd.com/img/logos/US/${item.ticker}.png`} 
                        alt={item.ticker}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback to colored background with ticker text if image fails
                          const target = e.currentTarget as HTMLImageElement;
                          target.style.display = 'none';
                          const fallback = target.nextElementSibling as HTMLElement;
                          if (fallback) fallback.style.display = 'flex';
                        }}
                      />
                      <div className="w-full h-full bg-[#1B263B] rounded-full flex items-center justify-center" style={{display: 'none'}}>
                        <span className="text-white text-xs font-bold">{item.ticker}</span>
                      </div>
                    </div>
                    <div>
                      <div className="font-semibold text-[#1B263B]">
                        {item.ticker === 'AAPL' ? 'Apple Inc.' : 
                         item.ticker === 'NVDA' ? 'NVIDIA Corp.' : 
                         item.ticker === 'JPM' ? 'JPMorgan Chase' : 
                         item.ticker}
                      </div>
                      <div className="text-xs text-[#495057]">
                        {item.ticker === 'AAPL' ? '25.3% of portfolio' : 
                         item.ticker === 'NVDA' ? '18.7% of portfolio' : 
                         '15.2% of portfolio'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-semibold text-[#1B263B]">
                      {item.ticker === 'AAPL' ? '$175.43' : 
                       item.ticker === 'NVDA' ? '$892.15' : 
                       '$158.92'}
                    </div>
                    <div className="flex items-center gap-1">
                      <div className={`w-2 h-2 rounded-full ${
                        item.ticker === 'AAPL' ? 'bg-[#E63946]' : 
                        item.ticker === 'NVDA' ? 'bg-[#2EC4B6]' : 
                        'bg-[#FFD166]'
                      }`}></div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {/* Edit Button */}
                    <button
                      onClick={() => handleEdit(item)}
                      className="p-1 text-[#495057] hover:text-[#3A86FF] hover:bg-[#3A86FF]/10 rounded transition-colors"
                      title="Edit"
                    >
                      <Edit className="w-3 h-3" />
                    </button>
                    {/* Delete Button */}
                    <button
                      onClick={() => handleDelete(item.portfolio_id)}
                      className="p-1 text-[#495057] hover:text-[#E63946] hover:bg-[#E63946]/10 rounded transition-colors"
                      title="Remove"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-200 dark:border-slate-600">
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  Page {currentPage} of {totalPages} • {totalItems} total items
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage <= 1}
                    className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                  >
                    ←
                  </button>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                    className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                  >
                    →
                  </button>
                </div>
              </div>
            )}

            {/* Empty State */}
            {filteredItems.length === 0 && !loading && (
              <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                {searchTerm ? `No holdings found matching "${searchTerm}"` : 'No holdings in your portfolio'}
              </div>
            )}
          </>
        )}
      </div>

      <HoldingsModal 
        isOpen={isModalOpen} 
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
        editItem={editItem}
      />
    </>
  );
});

export default Holdings;
