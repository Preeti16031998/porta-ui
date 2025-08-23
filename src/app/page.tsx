'use client';

import { useState, useEffect } from 'react';
import PortfolioSummary from '@/components/PortfolioSummary';
import Holdings from '@/components/Holdings';
import Watchlist from '@/components/Watchlist';
import IndustryInsights from '@/components/IndustryInsights';
import EarningsEvents from '@/components/EarningsEvents';
import News from '@/components/News';
import Chat from '@/components/Chat';
import TestWatchlist from '@/components/TestWatchlist';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                Porta
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Your Portfolio's AI Research Assistant
              </p>
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              Bloomberg Terminal intelligence, reimagined for everyday investors
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Portfolio Feed */}
          <div className="lg:col-span-2 space-y-6">
            {/* Portfolio Summary */}
            <PortfolioSummary />
            
            {/* Holdings and Watchlist Side by Side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Holdings />
              <Watchlist />
            </div>
            
            {/* Industry Insights */}
            <IndustryInsights />
            
            {/* Earnings & Events */}
            <EarningsEvents />
            
            {/* News */}
            <News />
          </div>
          
          {/* Right Panel - Action Hub */}
          <div className="space-y-6">
            <TestWatchlist />
            <Chat />
          </div>
        </div>
      </div>
    </div>
  );
}
