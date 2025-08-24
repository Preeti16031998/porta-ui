'use client';

import { useState, useEffect, useRef } from 'react';
import { Settings } from 'lucide-react';
import PortfolioSummary, { PortfolioSummaryRef } from '@/components/PortfolioSummary';
import Holdings, { HoldingsRef } from '@/components/Holdings';
import Watchlist, { WatchlistRef } from '@/components/Watchlist';

import EarningsEvents from '@/components/EarningsEvents';
import News, { NewsRef } from '@/components/News';
import Chat from '@/components/Chat';
import TestWatchlist from '@/components/TestWatchlist';
import UserPreferencesModal from '@/components/UserPreferencesModal';

export default function Home() {
  const portfolioSummaryRef = useRef<PortfolioSummaryRef>(null);
  const watchlistRef = useRef<WatchlistRef>(null);
  const holdingsRef = useRef<HoldingsRef>(null);
  const [isPreferencesModalOpen, setIsPreferencesModalOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState<string>('');
  const chatRef = useRef<any>(null);
  const newsRef = useRef<NewsRef>(null);

  // Function to handle sending messages from News component to Chat
  const handleNewsToChat = (message: string) => {
    setChatMessage(message);
    // Clear the message after a short delay to prevent re-sending
    setTimeout(() => setChatMessage(''), 100);
  };



  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      {/* Header */}
      <header className="bg-[#F7F7F7] sticky top-0 z-50 py-1">
        <div className="px-8" style={{ paddingTop: 'calc(var(--spacing) * 2)', paddingBottom: 'calc(var(--spacing) * 2)' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <img src="/porta-text.svg" alt="Porta" className="h-14 porta-logo-navy" />
            </div>
            <button
              onClick={() => setIsPreferencesModalOpen(true)}
              className="px-4 py-2 bg-[#1B263B] text-white hover:bg-[#1B263B]/90 rounded-full transition-colors font-medium"
              title="User Preferences"
            >
              Manage Preferences
            </button>
          </div>
        </div>
      </header>

      {/* Main Content - Unified Layout */}
      <div className="flex h-[calc(100vh-88px)]">
        {/* Left Column - Scrollable Portfolio Widgets */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 scrollbar-hide">
          {/* Portfolio Summary */}
          <PortfolioSummary ref={portfolioSummaryRef} />
          
          {/* Holdings and Watchlist Side by Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Holdings 
              ref={holdingsRef} 
              onPortfolioUpdate={() => {
                if (newsRef.current?.refresh) {
                  newsRef.current.refresh();
                }
              }}
            />
            <Watchlist 
              ref={watchlistRef} 
              onPortfolioUpdate={() => {
                if (newsRef.current?.refresh) {
                  newsRef.current.refresh();
                }
              }}
            />
          </div>
          
          {/* News */}
          <News ref={newsRef} onSendMessage={handleNewsToChat} />
          
          {/* Earnings & Events */}
          <EarningsEvents />
        </div>
        
        {/* Right Column - Chat Interface */}
        <div className="w-[45%] px-6 py-6">
          <Chat 
            ref={chatRef}
            initialMessage={chatMessage}
            onPortfolioUpdate={() => {
              portfolioSummaryRef.current?.refresh();
              holdingsRef.current?.refresh();
              watchlistRef.current?.refresh();
              if (newsRef.current?.refresh) {
                newsRef.current.refresh();
              }
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
