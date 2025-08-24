'use client';

import { useState } from 'react';
import { Calendar, Clock, AlertCircle, TrendingUp, DollarSign, FileText, Package, Plus } from 'lucide-react';

interface Event {
  id: string;
  ticker: string;
  name: string;
  eventType: 'Earnings' | 'Dividend' | 'Guidance' | 'Product';
  date: string;
  time: string;
  countdown: string;
  note: string;
  timeSensitivity: 'high' | 'medium' | 'low';
}

interface EarningsEventsProps {
  onSendMessage?: (message: string) => void;
}

export default function EarningsEvents({ onSendMessage }: EarningsEventsProps) {
  const [selectedRange, setSelectedRange] = useState<'This Week' | 'Next 2 Weeks' | 'Month'>('This Week');
  const [selectedFilter, setSelectedFilter] = useState<'All' | 'Earnings' | 'Dividend' | 'Guidance' | 'Product'>('All');

  const events: Event[] = [
    {
      id: '1',
      ticker: 'AMZN',
      name: 'Amazon.com Inc.',
      eventType: 'Earnings',
      date: '2025-08-28',
      time: '4:00 PM',
      countdown: 'in 4d',
      note: 'Q3 2025 Earnings: Amazon\'s next earnings date is projected for Thursday, October 30, 2025, after market close.',
      timeSensitivity: 'high'
    }
  ];

  const filteredEvents = events.filter(event => {
    if (selectedFilter !== 'All' && event.eventType !== selectedFilter) return false;
    
    const eventDate = new Date(event.date);
    const today = new Date();
    const diffTime = eventDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    switch (selectedRange) {
      case 'This Week':
        return diffDays >= 0 && diffDays <= 7;
      case 'Next 2 Weeks':
        return diffDays >= 0 && diffDays <= 14;
      case 'Month':
        return diffDays >= 0 && diffDays <= 30;
      default:
        return true;
    }
  });

  const getEventTypeIcon = (eventType: string) => {
    switch (eventType) {
      case 'Earnings':
        return <TrendingUp className="w-4 h-4" />;
      case 'Dividend':
        return <DollarSign className="w-4 h-4" />;
      case 'Guidance':
        return <FileText className="w-4 h-4" />;
      case 'Product':
        return <Package className="w-4 h-4" />;
      default:
        return <Calendar className="w-4 h-4" />;
    }
  };

  const getEventTypeColor = (eventType: string) => {
    switch (eventType) {
      case 'Earnings':
        return 'bg-[#3A86FF]/10 text-[#3A86FF]';
      case 'Dividend':
        return 'bg-[#2EC4B6]/10 text-[#2EC4B6]';
      case 'Guidance':
        return 'bg-[#FFD166]/10 text-[#FFD166]';
      case 'Product':
        return 'bg-[#1B263B]/10 text-[#1B263B]';
      default:
        return 'bg-[#495057]/10 text-[#495057]';
    }
  };

  const getTimeSensitivityColor = (sensitivity: string) => {
    switch (sensitivity) {
      case 'high':
        return 'bg-[#E63946]';
      case 'medium':
        return 'bg-[#FFD166]';
      case 'low':
        return 'bg-[#2EC4B6]';
      default:
        return 'bg-[#495057]';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const groupedEvents = filteredEvents.reduce((groups, event) => {
    const date = formatDate(event.date);
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(event);
    return groups;
  }, {} as Record<string, Event[]>);

  return (
          <div className="bg-[#FCFCFC] rounded-3xl shadow-lg border border-slate-300/50 p-6">
      {/* Header */}
                              <div className="flex items-center justify-between mb-6">
                                                     <h2 className="text-xl font-bold text-[#1B263B] tracking-tight">
                   Earnings & Events
                 </h2>
          <div className="flex items-center gap-2">
            {/* Range Selector */}
            <div className="flex bg-[#F8F9FA] rounded-lg p-1">
              {(['This Week', 'Next 2 Weeks', 'Month'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setSelectedRange(range)}
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

      {/* Filter Pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        {(['All', 'Earnings', 'Dividend', 'Guidance', 'Product'] as const).map((filter) => (
          <button
            key={filter}
            onClick={() => setSelectedFilter(filter)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              selectedFilter === filter
                ? 'bg-[#1B263B] text-white'
                : 'bg-[#F8F9FA] text-[#495057] hover:bg-[#E9ECEF]'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Events List */}
      <div className="space-y-6">
        {Object.keys(groupedEvents).length === 0 ? (
          <div className="text-center py-8 text-slate-500 dark:text-slate-400">
            <Calendar className="w-12 h-12 mx-auto mb-4 text-slate-300" />
            <div className="text-lg font-medium mb-2">No scheduled events</div>
            <div className="text-sm">No events found in this {selectedRange.toLowerCase()} window.</div>
            <button className="mt-4 px-4 py-2 bg-[#1B263B] hover:bg-[#1B263B]/90 text-white rounded-lg transition-colors">
              Change range
            </button>
          </div>
        ) : (
          Object.entries(groupedEvents).map(([date, dateEvents]) => (
            <div key={date}>
              <div className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-3">
                {date}
              </div>
              <div className="space-y-3">
                {dateEvents.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-start gap-4 p-4 bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600"
                  >
                    {/* Time Sensitivity Strip */}
                    <div className={`w-1 h-full rounded-full ${getTimeSensitivityColor(event.timeSensitivity)}`} />
                    
                    {/* Event Content */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-[#1B263B] rounded-lg flex items-center justify-center">
                            <span className="text-sm font-bold text-white">
                              {event.ticker}
                            </span>
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 dark:text-white">
                              {event.name}
                            </div>
                            <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getEventTypeColor(event.eventType)}`}>
                              {getEventTypeIcon(event.eventType)}
                              {event.eventType}
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                            <Clock className="w-4 h-4" />
                            <span>{event.time}</span>
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-500">
                            {event.countdown}
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                        {event.note}
                      </div>
                      
                      {/* Action Chips */}
                      <div className="flex flex-wrap gap-2">
                        <button 
                          onClick={() => {
                            if (onSendMessage) {
                              onSendMessage(`Please explain this ${event.eventType.toLowerCase()} event for ${event.ticker}: ${event.note}`);
                            }
                          }}
                          className="px-3 py-1 bg-slate-100 dark:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg text-xs hover:bg-slate-200 dark:hover:bg-slate-500 transition-colors"
                        >
                          Explain
                        </button>
                        <button className="px-3 py-1 bg-slate-100 dark:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg text-xs hover:bg-slate-200 dark:hover:bg-slate-500 transition-colors">
                          Add to calendar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
