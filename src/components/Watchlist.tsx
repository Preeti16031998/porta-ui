'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Search, Plus, Eye, Trash2, ChevronLeft, ChevronRight, User } from 'lucide-react';
import WatchlistModal from './WatchlistModal';
import { useUserId } from '@/hooks/useUser';
import { WatchlistService, WatchlistItem } from '@/services/api';

export default function Watchlist() {
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
      } catch (error) {
        console.error('Failed to delete watchlist item:', error);
        alert('Failed to delete item. Please try again.');
      }
    }
  }, [fetchWatchlist]);

  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const handleModalSuccess = useCallback(() => {
    fetchWatchlist(); // Refresh the list
    handleModalClose();
  }, [fetchWatchlist, handleModalClose]);

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
      <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200/50 dark:border-slate-700/50 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              Watchlist
            </h2>
            {/* User ID Display */}
            {userId && (
              <div className="flex items-center gap-2 mt-1 text-sm text-slate-600 dark:text-slate-400">
                <User className="w-4 h-4" />
                <span className="font-mono text-xs">{userId}</span>
              </div>
            )}
          </div>
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
                      <div className="text-xs text-slate-500 dark:text-slate-500">
                        Added {formatDate(item.created_at)}
                      </div>
                      {item.note && (
                        <div className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                          {item.note}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {/* Delete Button */}
                    <button
                      onClick={() => handleDelete(item.watchlist_id)}
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
}
