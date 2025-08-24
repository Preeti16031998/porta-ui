'use client';

import { useState, useEffect, useRef } from 'react';
import { Settings } from 'lucide-react';
import PortfolioSummary, { PortfolioSummaryRef } from '@/components/PortfolioSummary';
import Holdings, { HoldingsRef } from '@/components/Holdings';
import Watchlist, { WatchlistRef } from '@/components/Watchlist';

import EarningsEvents from '@/components/EarningsEvents';
import News from '@/components/News';
import Chat from '@/components/Chat';
import TestWatchlist from '@/components/TestWatchlist';
import UserPreferencesModal from '@/components/UserPreferencesModal';

export default function Home() {
  const portfolioSummaryRef = useRef<PortfolioSummaryRef>(null);
  const watchlistRef = useRef<WatchlistRef>(null);
  const holdingsRef = useRef<HoldingsRef>(null);
  const [isPreferencesModalOpen, setIsPreferencesModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F9FA] to-slate-100">
      {/* Header */}
      <header className="bg-[#1B263B] border-b border-[#495057]/10 sticky top-0 z-50 shadow-lg">
        <div className="px-8" style={{ paddingTop: 'calc(var(--spacing) * 2)', paddingBottom: 'calc(var(--spacing) * 2)' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <img src="/porta-text.svg" alt="Porta" className="h-12" />
            </div>
            <button
              onClick={() => setIsPreferencesModalOpen(true)}
              className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              title="User Preferences"
            >
              <Settings className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content - Unified Layout */}
      <div className="flex h-[calc(100vh-88px)]">
        {/* Left Column - Scrollable Portfolio Widgets */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {/* Portfolio Summary */}
          <PortfolioSummary ref={portfolioSummaryRef} />
          
          {/* Holdings and Watchlist Side by Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Holdings ref={holdingsRef} />
            <Watchlist ref={watchlistRef} />
          </div>
          
          {/* News */}
          <News />
          
          {/* Earnings & Events */}
          <EarningsEvents />
        </div>
        
        {/* Right Column - Chat Interface */}
        <div className="w-1/2 px-6 py-6">
          <Chat 
            onPortfolioUpdate={() => {
              portfolioSummaryRef.current?.refresh();
              holdingsRef.current?.refresh();
              watchlistRef.current?.refresh();
            }} 
          />
        </div>
      </div>

      {/* User Preferences Modal */}
      <UserPreferencesModal 
        isOpen={isPreferencesModalOpen} 
        onClose={() => setIsPreferencesModalOpen(false)} 
      />
    </div>
  );
}
