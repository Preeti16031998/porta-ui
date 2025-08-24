import { apiClient, ApiResponse } from '@/lib/api';
import { getCurrentUserId } from '@/lib/api';

// Example API service for portfolio data
export interface PortfolioData {
  id: string;
  name: string;
  value: number;
  change: number;
  changePercent: number;
  holdings: Holding[];
}

export interface Holding {
  id: string;
  symbol: string;
  name: string;
  quantity: number;
  price: number;
  value: number;
  change: number;
  changePercent: number;
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  publishedAt: string;
  source: string;
  url: string;
}

export interface EarningsEvent {
  id: string;
  symbol: string;
  companyName: string;
  earningsDate: string;
  estimate: number;
  actual?: number;
  surprise?: number;
}

// Watchlist interfaces - updated to match your API response
export interface WatchlistItem {
  ticker: string;
  note: string | null;
  watchlist_id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  delete_nbr: number;
}

export interface CreateWatchlistRequest {
  user_id: string;
  ticker: string;
  note: string;
}

export interface UpdateWatchlistRequest {
  note?: string;
}

export interface WatchlistFilters {
  user_id: string;
  page?: number;
  size?: number;
}

export interface WatchlistListResponse {
  watchlists: WatchlistItem[];
  total: number;
  page: number;
  size: number;
  pages: number;
}



// News API service
export class NewsService {
  // Get market news
  static async getMarketNews(limit = 10): Promise<ApiResponse<NewsItem[]>> {
    return apiClient.get<NewsItem[]>(`/api/news?limit=${limit}`);
  }

  // Get company-specific news
  static async getCompanyNews(symbol: string, limit = 10): Promise<ApiResponse<NewsItem[]>> {
    return apiClient.get<NewsItem[]>(`/api/news/${symbol}?limit=${limit}`);
  }
}

// Earnings API service
export class EarningsService {
  // Get upcoming earnings
  static async getUpcomingEarnings(days = 7): Promise<ApiResponse<EarningsEvent[]>> {
    return apiClient.get<EarningsEvent[]>(`/api/earnings/upcoming?days=${days}`);
  }

  // Get earnings history
  static async getEarningsHistory(symbol: string, limit = 10): Promise<ApiResponse<EarningsEvent[]>> {
    return apiClient.get<EarningsEvent[]>(`/api/earnings/${symbol}/history?limit=${limit}`);
  }
}

// Industry insights API service
export class IndustryService {
  // Get industry performance
  static async getIndustryPerformance(): Promise<ApiResponse<any[]>> {
    return apiClient.get<any[]>('/api/industry/performance');
  }

  // Get sector analysis
  static async getSectorAnalysis(): Promise<ApiResponse<any[]>> {
    return apiClient.get<any[]>('/api/industry/sectors');
  }
}

// Enhanced Watchlist API service - updated to match your API format
export class WatchlistService {
  // List watchlists with pagination and filters
  static async getWatchlists(filters: WatchlistFilters): Promise<ApiResponse<WatchlistListResponse>> {
    const params = new URLSearchParams();
    
    params.append('user_id', filters.user_id);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.size) params.append('size', filters.size.toString());
    
    const queryString = params.toString();
    const endpoint = `/api/v1/watchlist${queryString ? `?${queryString}` : ''}`;
    
    return apiClient.get<WatchlistListResponse>(endpoint);
  }

  // Get watchlist by ID
  static async getWatchlistById(id: string): Promise<ApiResponse<WatchlistItem>> {
    return apiClient.get<WatchlistItem>(`/api/v1/watchlist/${id}`);
  }

  // Create new watchlist entry
  static async createWatchlist(data: CreateWatchlistRequest): Promise<ApiResponse<WatchlistItem>> {
    return apiClient.post<WatchlistItem>('/api/v1/watchlist/', data);
  }

  // Update watchlist entry
  static async updateWatchlist(id: string, data: UpdateWatchlistRequest): Promise<ApiResponse<WatchlistItem>> {
    return apiClient.put<WatchlistItem>(`/api/v1/watchlist/${id}`, data);
  }

  // Delete watchlist entry (soft delete)
  static async deleteWatchlist(id: string): Promise<ApiResponse<{ success: boolean }>> {
    return apiClient.delete<{ success: boolean }>(`/api/v1/watchlist/${id}`);
  }

  // Legacy method for backward compatibility
  static async getWatchlist(): Promise<ApiResponse<WatchlistItem[]>> {
    const userId = getCurrentUserId();
    const response = await this.getWatchlists({ user_id: userId });
    if (response.success) {
      return {
        ...response,
        data: response.data.watchlists,
      };
    }
    return response as any;
  }
}

// Portfolio API service - updated to match your API format
export interface PortfolioItem {
  portfolio_id: string;
  user_id: string;
  ticker: string;
  quantity: string;
  buy_price: string;
  note: string | null;
  created_at: string;
  updated_at: string;
  delete_nbr: number;
  current_price?: string;
  total_cost?: string;
  current_value?: string;
  unrealized_pnl?: string;
  pnl_percentage?: string;
  is_profitable?: boolean;
}

export interface CreatePortfolioRequest {
  user_id: string;
  ticker: string;
  quantity: string;
  buy_price: string;
  note?: string;
}

export interface UpdatePortfolioRequest {
  quantity?: string;
  buy_price?: string;
  note?: string;
}

export interface PortfolioFilters {
  user_id?: string;
  ticker?: string;
  page?: number;
  size?: number;
  include_pnl?: boolean;
}

export interface PortfolioListResponse {
  portfolios: PortfolioItem[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export class PortfolioService {
  // Get all portfolio holdings with pagination and filters
  static async getPortfolios(filters: PortfolioFilters): Promise<ApiResponse<PortfolioListResponse>> {
    const params = new URLSearchParams();
    
    if (filters.user_id) params.append('user_id', filters.user_id);
    if (filters.ticker) params.append('ticker', filters.ticker);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.size) params.append('size', filters.size.toString());
    if (filters.include_pnl) params.append('include_pnl', filters.include_pnl.toString());
    
    const queryString = params.toString();
    const endpoint = `/api/v1/portfolio${queryString ? `?${queryString}` : ''}`;
    
    return apiClient.get<PortfolioListResponse>(endpoint);
  }

  // Get portfolio by ID
  static async getPortfolioById(id: string): Promise<ApiResponse<PortfolioItem>> {
    return apiClient.get<PortfolioItem>(`/api/v1/portfolio/${id}`);
  }

  // Create new portfolio entry
  static async createPortfolio(data: CreatePortfolioRequest): Promise<ApiResponse<PortfolioItem>> {
    return apiClient.post<PortfolioItem>('/api/v1/portfolio/', data);
  }

  // Update portfolio entry
  static async updatePortfolio(id: string, data: UpdatePortfolioRequest): Promise<ApiResponse<PortfolioItem>> {
    return apiClient.put<PortfolioItem>(`/api/v1/portfolio/${id}`, data);
  }

  // Delete portfolio entry
  static async deletePortfolio(id: string): Promise<ApiResponse<{ message: string; portfolio_id: string; deleted_at: string }>> {
    return apiClient.delete<{ message: string; portfolio_id: string; deleted_at: string }>(`/api/v1/portfolio/${id}`);
  }

  // Legacy method for backward compatibility
  static async getHoldings(): Promise<ApiResponse<PortfolioItem[]>> {
    const userId = getCurrentUserId();
    const response = await this.getPortfolios({ user_id: userId, include_pnl: true });
    if (response.success) {
      return {
        ...response,
        data: response.data.portfolios,
      };
    }
    return response as any;
  }
}

// Export all services
export const apiServices = {
  portfolio: PortfolioService,
  news: NewsService,
  earnings: EarningsService,
  industry: IndustryService,
  watchlist: WatchlistService,
};
