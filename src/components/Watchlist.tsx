'use client';

import { useState, useEffect, useCallback, useMemo, useImperativeHandle, forwardRef } from 'react';
import { Search, Plus, Eye, Trash2, ChevronLeft, ChevronRight, User, RefreshCw } from 'lucide-react';
import WatchlistModal from './WatchlistModal';
import { useUserId } from '@/hooks/useUser';
import { WatchlistService, WatchlistItem } from '@/services/api';

export interface WatchlistRef {
  refresh: () => Promise<void>;
}

interface WatchlistProps {
  onPortfolioUpdate?: () => void;
}

const Watchlist = forwardRef<WatchlistRef, WatchlistProps>(({ onPortfolioUpdate }, ref) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const userId = useUserId();

  // Debug logging
  useEffect(() => {
    console.log('Watchlist component - userId:', userId);
    console.log('Watchlist component - current state:', { data, loading, error, currentPage });
  }, [userId, data, loading, error, currentPage]);

  // Stable API call function
  const fetchWatchlist = useCallback(async () => {
    if (!userId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching watchlist for user:', userId, 'page:', currentPage);
      
      const response = await WatchlistService.getWatchlists({
        user_id: userId,
        page: currentPage,
        size: pageSize
      });
      
      console.log('Watchlist API response:', response);
      
      if (response.success) {
        setData(response.data);
        console.log('Watchlist data set:', response.data);
      } else {
        console.error('Watchlist API error:', response.error);
        setError(response.error || 'Failed to fetch watchlist');
      }
    } catch (err) {
      console.error('Watchlist fetch error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [userId, currentPage]);

  // Expose refresh function to parent components
  useImperativeHandle(ref, () => ({
    refresh: fetchWatchlist
  }), [fetchWatchlist]);

  // Fetch data when component mounts or userId/currentPage changes
  useEffect(() => {
    if (userId) {
      fetchWatchlist();
    }
  }, [userId, currentPage, fetchWatchlist]);

  const handlePageChange = useCallback((newPage: number) => {
    setCurrentPage(newPage);
  }, []);

  const handleDelete = useCallback(async (id: string) => {
    if (confirm('Are you sure you want to remove this item from your watchlist?')) {
      try {
        await WatchlistService.deleteWatchlist(id);
        // Refresh the current page
        fetchWatchlist();
        // Also refresh News component when watchlist items are deleted
        if (onPortfolioUpdate) {
          onPortfolioUpdate();
        }
      } catch (error) {
        console.error('Failed to delete watchlist item:', error);
        alert('Failed to delete item. Please try again.');
      }
    }
  }, [fetchWatchlist, onPortfolioUpdate]);

  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const handleModalSuccess = useCallback(() => {
    fetchWatchlist(); // Refresh the list
    handleModalClose();
    // Notify parent component to refresh News component
    if (onPortfolioUpdate) {
      onPortfolioUpdate();
    }
  }, [fetchWatchlist, handleModalClose, onPortfolioUpdate]);

  const formatDate = useCallback((dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }, []);

  // Memoized computed values
  const watchlistItems = useMemo(() => data?.watchlists || [], [data]);
  const totalPages = useMemo(() => data?.pages || 1, [data]);
  const totalItems = useMemo(() => data?.total || 0, [data]);

  // Filter items by search term
  const filteredItems = useMemo(() => 
    watchlistItems.filter((item: WatchlistItem) =>
      item.ticker.toLowerCase().includes(searchTerm.toLowerCase())
    ), [watchlistItems, searchTerm]
  );

  return (
    <>
      <div className="bg-[#FCFCFC] rounded-3xl shadow-lg border border-slate-300/50 p-6 transition-shadow duration-300 hover:shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-[#1B263B] tracking-tight">
              Watchlist
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                fetchWatchlist();
                // Also refresh News component when watchlist is refreshed
                if (onPortfolioUpdate) {
                  onPortfolioUpdate();
                }
              }}
              disabled={loading}
              className="p-2 text-[#495057] hover:text-[#3A86FF] disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors hover:bg-white/50"
              title="Refresh Watchlist"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="w-8 h-8 bg-[#1B263B] hover:bg-[#1B263B]/90 text-white rounded-full transition-all duration-300 flex items-center justify-center hover:scale-105 hover:shadow-md"
              title="Add to Watchlist"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>



        {/* Loading State */}
        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading watchlist...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <h3 className="text-red-800 font-medium">Error Loading Watchlist</h3>
            <p className="text-red-600 text-sm mt-1">{error}</p>
            <button
              onClick={fetchWatchlist}
              className="mt-2 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        )}

        {/* Watchlist Items */}
        {!loading && !error && (
          <>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {filteredItems.map((item: WatchlistItem) => (
                <div
                  key={item.watchlist_id}
                  className="flex items-center justify-between p-2 bg-[#FCFCFC] rounded-lg hover:bg-slate-100 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-sm"
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
                          if (fallback) {
                            fallback.style.display = 'flex';
                          }
                        }}
                      />
                      <div className={`w-full h-full rounded-full flex items-center justify-center ${
                        item.ticker === 'TSLA' ? 'bg-[#8B5CF6]' : 
                        item.ticker === 'AMZN' ? 'bg-[#E63946]' : 
                        'bg-[#1B263B]'
                      }`} style={{display: 'none'}}>
                        <span className="text-white text-xs font-bold">{item.ticker}</span>
                      </div>
                    </div>
                    <div>
                      <div className="font-semibold text-[#1B263B]">
                        {item.ticker === 'TSLA' ? 'Tesla Inc.' : 
                         item.ticker === 'AMZN' ? 'Amazon.com Inc.' : 
                         item.ticker}
                      </div>
                      <div className="text-xs text-[#495057]">
                        {item.ticker === 'TSLA' ? '$248.73' : 
                         item.ticker === 'AMZN' ? '$142.81' : 
                         ''}
                      </div>
                      <div className="text-xs text-[#495057]">
                        {item.ticker === 'TSLA' ? '+2.4% today' : 
                         item.ticker === 'AMZN' ? '-1.2% today' : 
                         ''}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {/* Delete Button */}
                    <button
                      onClick={() => handleDelete(item.watchlist_id)}
                      className="p-1 text-[#495057] hover:text-[#E63946] hover:bg-[#F8F9FA] rounded transition-colors"
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
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                    className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Empty State */}
            {filteredItems.length === 0 && !loading && (
              <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                {searchTerm ? `No watchlist items found matching "${searchTerm}"` : 'No companies in your watchlist'}
              </div>
            )}
          </>
        )}
      </div>

      <WatchlistModal 
        isOpen={isModalOpen} 
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
      />
    </>
  );
});

export default Watchlist;
