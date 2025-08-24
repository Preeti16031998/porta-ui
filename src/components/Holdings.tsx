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
      <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200/50 dark:border-slate-700/50 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              Holdings
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
              onClick={fetchHoldings}
              disabled={loading}
              className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
              title="Refresh Holdings"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          </div>
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

        {/* Loading State */}
        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading holdings...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <h3 className="text-red-800 font-medium">Error Loading Holdings</h3>
            <p className="text-red-600 text-sm mt-1">{error}</p>
            <button
              onClick={fetchHoldings}
              className="mt-2 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
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
                  className="flex items-center justify-between p-3 bg-slate-50/50 dark:bg-slate-700/50 rounded-lg border border-slate-200/50 dark:border-slate-600/50 hover:bg-slate-100/50 dark:hover:bg-slate-600/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                      {item.is_profitable ? (
                        <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400" />
                      )}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {item.ticker}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-500">
                        {formatNumber(item.quantity)} shares @ {formatCurrency(item.buy_price)}
                      </div>
                      {item.note && (
                        <div className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                          {item.note}
                        </div>
                      )}
                      <div className="text-xs text-slate-500 dark:text-slate-500">
                        Added {formatDate(item.created_at)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    {item.current_price && item.current_value && item.unrealized_pnl && (
                      <>
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {formatCurrency(item.current_price)}
                        </div>
                        <div className={`text-sm ${
                          parseFloat(item.unrealized_pnl) >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {parseFloat(item.unrealized_pnl) >= 0 ? '+' : ''}{formatCurrency(item.unrealized_pnl)}
                        </div>
                        {item.pnl_percentage && (
                          <div className={`text-sm ${
                            parseFloat(item.pnl_percentage) >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            ({parseFloat(item.pnl_percentage) >= 0 ? '+' : ''}{parseFloat(item.pnl_percentage)}%)
                          </div>
                        )}
                      </>
                    )}
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      {formatCurrency(item.total_cost || (parseFloat(item.quantity) * parseFloat(item.buy_price)))}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {/* Edit Button */}
                    <button
                      onClick={() => handleEdit(item)}
                      className="p-1 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                      title="Edit"
                    >
                      <Edit className="w-3 h-3" />
                    </button>
                    {/* Delete Button */}
                    <button
                      onClick={() => handleDelete(item.portfolio_id)}
                      className="p-1 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
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
