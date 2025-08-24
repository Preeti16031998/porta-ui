'use client';

import { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { Newspaper, ExternalLink, TrendingUp, TrendingDown, AlertCircle, Clock, Building2, MessageSquare, RefreshCw } from 'lucide-react';

interface NewsItem {
  news_id: string;
  ticker: string;
  title: string;
  description: string | null;
  url: string;
  source: string | null;
  published_at: string | null;
  content: string | null;
  bullet_points: string[] | null;
  sentiment: string | null;
  relevance_score: number | null;
  ticker_source: string;
  created_at: string;
  updated_at: string;
}

interface NewsFilters {
  page: number;
  size: number;
}

interface NewsResponse {
  news: NewsItem[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

interface NewsProps {
  onSendMessage?: (message: string) => void;
}

export interface NewsRef {
  refresh: () => Promise<void>;
}

const News = forwardRef<NewsRef, NewsProps>(({ onSendMessage }, ref) => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRange, setSelectedRange] = useState<'Today' | '3 Days' | 'Week'>('Today');
  const [filters, setFilters] = useState<NewsFilters>({
    page: 1,
    size: 10
  });
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [portfolioTickers, setPortfolioTickers] = useState<string[]>([]);

  // Refresh function that can be called from parent component
  const refreshNews = async () => {
    // Refresh portfolio tickers and news
    await fetchPortfolioTickers();
    if (selectedRange === 'Today') {
      await fetchTopNews();
    } else {
      await fetchNews(filters);
    }
  };

  // Expose refresh function to parent component
  useImperativeHandle(ref, () => ({
    refresh: refreshNews
  }), []);

  // Fetch portfolio tickers (holdings + watchlist)
  const fetchPortfolioTickers = async () => {
    try {
      const userId = process.env.NEXT_PUBLIC_USER_ID || 'f00dc8bd-eabc-4143-b1f0-fbcb9715a02e';
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
      
      // Fetch holdings
      const holdingsUrl = `${apiBaseUrl}/api/v1/portfolio/?user_id=${userId}&include_pnl=true`;
      const holdingsResponse = await fetch(holdingsUrl);
      const holdingsData = await holdingsResponse.json();
      
      // Fetch watchlist
      const watchlistUrl = `${apiBaseUrl}/api/v1/watchlist/?user_id=${userId}`;
      const watchlistResponse = await fetch(watchlistUrl);
      const watchlistData = await watchlistResponse.json();
      
      // Extract tickers from holdings and watchlist
      const holdingsTickers = holdingsData.portfolios?.map((item: any) => item.ticker) || [];
      const watchlistTickers = watchlistData.watchlists?.map((item: any) => item.ticker) || [];
      
      // Combine and remove duplicates
      const allTickers = [...new Set([...holdingsTickers, ...watchlistTickers])];
      
      setPortfolioTickers(allTickers);
      
      return allTickers;
    } catch (err) {
      console.error('Error fetching portfolio tickers:', err);
      return [];
    }
  };

  // Fetch news from API
  const fetchNews = async (filters: NewsFilters) => {
    try {
      setLoading(true);
      setError(null);
      
      // Get portfolio tickers if not already loaded
      let tickers = portfolioTickers;
      if (tickers.length === 0) {
        tickers = await fetchPortfolioTickers();
      }
      
      // If no portfolio tickers, show message
      if (tickers.length === 0) {
        setNews([]);
        setTotalPages(1);
        setCurrentPage(1);
        setLoading(false);
        return;
      }
      
      const params = new URLSearchParams();
      params.append('page', filters.page.toString());
      params.append('size', filters.size.toString());
      
      // Filter by portfolio tickers
      tickers.forEach(ticker => {
        params.append('ticker', ticker);
      });
      
      const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'}/api/v1/news/?${params.toString()}`;
      
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: NewsResponse = await response.json();
      setNews(data.news);
      setTotalPages(data.pages);
      setCurrentPage(data.page);
    } catch (err) {
      console.error('Error fetching news:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch news');
    } finally {
      setLoading(false);
    }
  };

  // Fetch top news
  const fetchTopNews = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get portfolio tickers if not already loaded
      let tickers = portfolioTickers;
      if (tickers.length === 0) {
        tickers = await fetchPortfolioTickers();
      }
      
      // If no portfolio tickers, show message
      if (tickers.length === 0) {
        setNews([]);
        setTotalPages(1);
        setCurrentPage(1);
        setLoading(false);
        return;
      }
      
      // For top news, we'll fetch news for portfolio tickers with pagination
      // since the /top endpoint might not support ticker filtering
      const params = new URLSearchParams();
      params.append('page', '1');
      params.append('size', '10');
      
      // Filter by portfolio tickers
      tickers.forEach(ticker => {
        params.append('ticker', ticker);
      });
      
      const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'}/api/v1/news/?${params.toString()}`;
      
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: NewsResponse = await response.json();
      setNews(data.news);
      setTotalPages(1);
      setCurrentPage(1);
    } catch (err) {
      console.error('Error fetching top news:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch top news');
    } finally {
      setLoading(false);
    }
  };

  // Load portfolio tickers on component mount
  useEffect(() => {
    fetchPortfolioTickers();
  }, []);

  // Load news when portfolio tickers change or selected range changes
  useEffect(() => {
    if (portfolioTickers.length > 0) {
      if (selectedRange === 'Today') {
        fetchTopNews();
      } else {
        fetchNews(filters);
      }
    }
  }, [portfolioTickers, selectedRange]);



  // Handle range changes
  const handleRangeChange = (range: 'Today' | '3 Days' | 'Week') => {
    setSelectedRange(range);
    setCurrentPage(1);
    
    if (range === 'Today') {
      fetchTopNews();
    } else {
      // For 3 Days and Week, fetch all news
      fetchNews({ page: 1, size: 10 });
    }
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    const newFilters = { page, size: 10 };
    setFilters(newFilters);
    fetchNews(newFilters);
  };

  // Handle action buttons
  const handleAction = (action: string, newsItem: NewsItem) => {
    if (!onSendMessage) return;
    
    let message = '';
    
    switch (action) {
      case 'explain':
        message = `Please explain this news article: "${newsItem.title}". ${newsItem.description ? `Description: ${newsItem.description}` : ''}`;
        break;
      case 'summarize':
        message = `Please summarize this news article: "${newsItem.title}". ${newsItem.description ? `Description: ${newsItem.description}` : ''}`;
        break;
      case 'stress_test':
        message = `Please perform a stress test analysis for ${newsItem.ticker} based on this news: "${newsItem.title}". ${newsItem.description ? `Description: ${newsItem.description}` : ''}`;
        break;
      default:
        return;
    }
    
    onSendMessage(message);
  };

  // Open source URL
  const openSource = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };



  // Format timestamp
  const formatTime = (timestamp: string | null) => {
    if (!timestamp) return 'Unknown time';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return date.toLocaleDateString();
  };

  // Get sentiment color
  const getSentimentColor = (sentiment: string | null) => {
    if (!sentiment) return 'text-slate-500';
    switch (sentiment.toLowerCase()) {
      case 'positive': return 'text-green-600';
      case 'negative': return 'text-red-600';
      case 'neutral': return 'text-slate-600';
      case 'mixed': return 'text-yellow-600';
      default: return 'text-slate-500';
    }
  };

  if (loading && news.length === 0) {
    return (
      <div className="bg-[#FCFCFC] rounded-3xl shadow-lg border border-slate-300/50 p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3A86FF]"></div>
          <span className="ml-3 text-[#495057]">Loading news...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#FCFCFC] rounded-3xl shadow-lg border border-slate-300/50 p-6">
        <div className="text-center py-8 text-[#495057]">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <div className="text-lg font-medium mb-2 text-[#1B263B]">Error loading news</div>
          <div className="text-sm">{error}</div>
          <button 
            onClick={() => fetchTopNews()}
            className="mt-4 px-4 py-2 bg-[#3A86FF] text-white rounded-lg hover:bg-[#2A75EF] transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FCFCFC] rounded-3xl shadow-lg border border-slate-300/50 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-[#1B263B] tracking-tight">
          News
        </h2>
        <div className="flex items-center gap-2">
          {/* Refresh Button */}
          <button
            onClick={() => {
              console.log('News - Manual refresh triggered');
              refreshNews();
            }}
            disabled={loading}
            className={`p-2 text-[#495057] hover:text-[#1B263B] hover:bg-[#F8F9FA] rounded-lg transition-colors ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            title="Refresh news"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          

          
          {/* Range Selector */}
          <div className="flex bg-[#F8F9FA] rounded-lg p-1">
            {(['Today', '3 Days', 'Week'] as const).map((range) => (
              <button
                key={range}
                onClick={() => handleRangeChange(range)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  selectedRange === range
                    ? 'bg-white text-[#1B263B] shadow-sm'
                    : 'text-[#495057] hover:text-[#1B263B]'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
      </div>



      {/* News List */}
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {loading && news.length === 0 ? (
          <div className="text-center py-8 text-[#495057]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3A86FF] mx-auto mb-4"></div>
            <span className="text-sm">Loading news...</span>
          </div>
        ) : portfolioTickers.length === 0 ? (
          <div className="text-center py-8 text-[#495057]">
            <Newspaper className="w-12 h-12 mx-auto mb-4 text-[#495057]/30" />
            <div className="text-lg font-medium mb-2 text-[#1B263B]">No portfolio found</div>
            <div className="text-sm">Add stocks to your portfolio or watchlist to see relevant news.</div>
          </div>
        ) : news.length === 0 ? (
          <div className="text-center py-8 text-[#495057]">
            <Newspaper className="w-12 h-12 mx-auto mb-4 text-[#495057]/30" />
            <div className="text-lg font-medium mb-2 text-[#1B263B]">No relevant news</div>
            <div className="text-sm">No news found for your portfolio stocks.</div>
          </div>
        ) : (
          <div className="relative">
            {loading && news.length > 0 && (
              <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#3A86FF]"></div>
                  <span className="text-sm text-[#495057]">Updating...</span>
                </div>
              </div>
            )}
            {news.map((item) => (
              <div
                key={item.news_id}
                className="p-4 bg-[#FCFCFC] rounded-lg hover:bg-slate-100 transition-colors"
              >
                {/* Header with Ticker and Severity */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full overflow-hidden">
                      <img
                        src={`https://eodhd.com/img/logos/US/${item.ticker}.png`}
                        alt={item.ticker}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.currentTarget as HTMLImageElement;
                          const fallback = target.nextElementSibling as HTMLElement;
                          if (fallback) {
                            target.style.display = 'none';
                            fallback.style.display = 'flex';
                          }
                        }}
                      />
                      <div 
                        className="w-full h-full bg-[#1B263B] rounded-full flex items-center justify-center hidden"
                        style={{ display: 'none' }}
                      >
                        <span className="text-sm font-bold text-white">
                          {item.ticker}
                        </span>
                      </div>
                    </div>
                                      <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-[#495057]">
                      {item.ticker}
                    </span>
                  </div>
                  </div>
                  
                  <div className="text-right text-sm text-[#495057]">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatTime(item.published_at)}
                    </div>
                  </div>
                </div>

                {/* Headline */}
                <h3 className="font-semibold text-[#1B263B] mb-3 text-lg">
                  {item.title}
                </h3>

                {/* Description */}
                {item.description && (
                  <p className="text-sm text-[#495057] mb-3">
                    {item.description}
                  </p>
                )}

                {/* Bullet Points */}
                {item.bullet_points && item.bullet_points.length > 0 && (
                  <div className="mb-3">
                    {item.bullet_points.map((bullet, index) => (
                      <div key={index} className="flex items-start gap-2 mb-2">
                        <div className="w-1.5 h-1.5 bg-slate-400 rounded-full mt-2 flex-shrink-0" />
                        <span className="text-sm text-[#495057]">
                          {bullet}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Meta Information */}
                <div className="flex items-center justify-between mb-3 text-xs text-slate-500">
                  <div className="flex items-center gap-4">
                    {item.source && (
                      <div className="flex items-center gap-1">
                        <Building2 className="w-3 h-3" />
                        <span>{item.source}</span>
                      </div>
                    )}
                    {item.sentiment && (
                      <span className={`font-medium ${getSentimentColor(item.sentiment)}`}>
                        {item.sentiment.charAt(0).toUpperCase() + item.sentiment.slice(1)}
                      </span>
                    )}
                    {item.relevance_score && (
                      <span className="text-slate-600">
                        Relevance: {(item.relevance_score * 100).toFixed(0)}%
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{formatTime(item.created_at)}</span>
                  </div>
                </div>

                {/* Action Chips */}
                <div className="flex flex-wrap gap-2">
                  <button 
                    onClick={() => handleAction('explain', item)}
                    className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs transition-colors flex items-center gap-1"
                  >
                    <MessageSquare className="w-3 h-3" />
                    Explain
                  </button>
                  <button 
                    onClick={() => handleAction('summarize', item)}
                    className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs transition-colors flex items-center gap-1"
                  >
                    <MessageSquare className="w-3 h-3" />
                    Summarize
                  </button>
                  <button 
                    onClick={() => openSource(item.url)}
                    className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs transition-colors flex items-center gap-1"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Open source
                  </button>
                  <button 
                    onClick={() => handleAction('stress_test', item)}
                    className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs transition-colors flex items-center gap-1"
                  >
                    <AlertCircle className="w-3 h-3" />
                    Stress Test
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-[#F8F9FA] text-[#495057] hover:bg-[#E9ECEF]"
          >
            Previous
          </button>
          
          <span className="text-sm text-[#495057]">
            Page {currentPage} of {totalPages}
          </span>
          
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-[#F8F9FA] text-[#495057] hover:bg-[#E9ECEF]"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
});

export default News;
