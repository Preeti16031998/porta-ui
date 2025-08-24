'use client';

import { useState, useEffect, useRef } from 'react';
import PortfolioSummary, { PortfolioSummaryRef } from '@/components/PortfolioSummary';
import Holdings, { HoldingsRef } from '@/components/Holdings';
import Watchlist, { WatchlistRef } from '@/components/Watchlist';

import EarningsEvents from '@/components/EarningsEvents';
import News from '@/components/News';
import Chat from '@/components/Chat';
import TestWatchlist from '@/components/TestWatchlist';

export default function Home() {
  const portfolioSummaryRef = useRef<PortfolioSummaryRef>(null);
  const watchlistRef = useRef<WatchlistRef>(null);
  const holdingsRef = useRef<HoldingsRef>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F9FA] to-slate-100">
      {/* Header */}
      <header className="bg-[#1B263B] border-b border-[#495057]/10 sticky top-0 z-50 shadow-lg">
        <div className="px-8" style={{ paddingTop: 'calc(var(--spacing) * 2)', paddingBottom: 'calc(var(--spacing) * 2)' }}>
          <div className="flex items-center">
            <div className="flex items-center">
              <img src="/porta-text.svg" alt="Porta" className="h-12" />
            </div>
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
          
          {/* Earnings & Events */}
          <EarningsEvents />
          
          {/* News */}
          <News />
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
    </div>
  );
}
