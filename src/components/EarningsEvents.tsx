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

export default function EarningsEvents() {
  const [selectedRange, setSelectedRange] = useState<'This Week' | 'Next 2 Weeks' | 'Month'>('This Week');
  const [selectedFilter, setSelectedFilter] = useState<'All' | 'Earnings' | 'Dividend' | 'Guidance' | 'Product'>('All');

  const events: Event[] = [
    {
      id: '1',
      ticker: 'AAPL',
      name: 'Apple Inc.',
      eventType: 'Earnings',
      date: '2024-01-25',
      time: '2:30 PM',
      countdown: 'in 2d',
      note: 'Q2 earnings call scheduled; consensus EPS available',
      timeSensitivity: 'high'
    },
    {
      id: '2',
      ticker: 'MSFT',
      name: 'Microsoft Corp.',
      eventType: 'Product',
      date: '2024-01-26',
      time: '10:00 AM',
      countdown: 'in 3d',
      note: 'New AI product launch event',
      timeSensitivity: 'medium'
    },
    {
      id: '3',
      ticker: 'JPM',
      name: 'JPMorgan Chase',
      eventType: 'Dividend',
      date: '2024-01-27',
      time: '9:00 AM',
      countdown: 'in 4d',
      note: 'Quarterly dividend payment',
      timeSensitivity: 'low'
    },
    {
      id: '4',
      ticker: 'TSLA',
      name: 'Tesla Inc.',
      eventType: 'Guidance',
      date: '2024-01-28',
      time: '3:00 PM',
      countdown: 'in 5d',
      note: 'Q1 2024 production guidance update',
      timeSensitivity: 'medium'
    },
    {
      id: '5',
      ticker: 'NVDA',
      name: 'NVIDIA Corp.',
      eventType: 'Earnings',
      date: '2024-01-29',
      time: '1:00 PM',
      countdown: 'in 6d',
      note: 'Q4 earnings call; AI chip demand focus',
      timeSensitivity: 'high'
    },
    {
      id: '6',
      ticker: 'AMZN',
      name: 'Amazon.com Inc.',
      eventType: 'Product',
      date: '2024-01-30',
      time: '11:00 AM',
      countdown: 'in 7d',
      note: 'AWS new service announcements',
      timeSensitivity: 'medium'
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
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'Dividend':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'Guidance':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'Product':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-900/20 dark:text-slate-400';
    }
  };

  const getTimeSensitivityColor = (sensitivity: string) => {
    switch (sensitivity) {
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-slate-500';
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
    <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200/50 dark:border-slate-700/50 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
          Earnings & Events
        </h2>
        <div className="flex items-center gap-2">
          {/* Range Selector */}
          <div className="flex bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
            {(['This Week', 'Next 2 Weeks', 'Month'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setSelectedRange(range)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  selectedRange === range
                    ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
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
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
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
            <button className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
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
                          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                            <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
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
                        <button className="px-3 py-1 bg-slate-100 dark:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg text-xs hover:bg-slate-200 dark:hover:bg-slate-500 transition-colors">
                          Explain
                        </button>
                        <button className="px-3 py-1 bg-slate-100 dark:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg text-xs hover:bg-slate-200 dark:hover:bg-slate-500 transition-colors">
                          What to watch
                        </button>
                        <button className="px-3 py-1 bg-slate-100 dark:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg text-xs hover:bg-slate-200 dark:hover:bg-slate-500 transition-colors">
                          Add to calendar
                        </button>
                        <button className="px-3 py-1 bg-slate-100 dark:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg text-xs hover:bg-slate-200 dark:hover:bg-slate-500 transition-colors">
                          Open source
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
