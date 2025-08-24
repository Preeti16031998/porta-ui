'use client';

import { useState } from 'react';
import { Newspaper, ExternalLink, TrendingUp, TrendingDown, AlertCircle, Clock, Building2 } from 'lucide-react';

interface NewsItem {
  id: string;
  ticker: string;
  headline: string;
  summary: string[];
  source: string;
  time: string;
  severity: 'high' | 'medium' | 'low';
  portfolioImpact: string;
}

export default function News() {
  const [selectedRange, setSelectedRange] = useState<'Today' | '3 Days' | 'Week'>('Today');
  const [selectedFilter, setSelectedFilter] = useState<'Holdings' | 'Watchlist' | 'High relevance'>('Holdings');

  const newsItems: NewsItem[] = [
    {
      id: '1',
      ticker: 'AAPL',
      headline: 'Apple Reports Strong Q2 Results, Beats EPS Estimates',
      summary: [
        'Q2 revenue increased 8% year-over-year to $119.6B',
        'Services segment growth accelerated to 14%',
        'iPhone sales in China exceeded expectations'
      ],
      source: 'SEC',
      time: '2h ago',
      severity: 'high',
      portfolioImpact: 'Positive impact on 15.2% portfolio weight'
    },
    {
      id: '2',
      ticker: 'MSFT',
      headline: 'Microsoft Azure Cloud Revenue Surges 30%',
      summary: [
        'Cloud services continue strong growth trajectory',
        'AI integration driving enterprise adoption',
        'Partnership with OpenAI expanding market reach'
      ],
      source: 'Bloomberg',
      time: '4h ago',
      severity: 'medium',
      portfolioImpact: 'Positive impact on 12.8% portfolio weight'
    },
    {
      id: '3',
      ticker: 'TSLA',
      headline: 'Tesla Faces Production Delays Due to Supply Chain Issues',
      summary: [
        'Q1 production guidance reduced by 15%',
        'Battery supply constraints affecting output',
        'European market demand remains strong'
      ],
      source: 'Reuters',
      time: '6h ago',
      severity: 'high',
      portfolioImpact: 'Negative impact on 8.7% portfolio weight'
    },
    {
      id: '4',
      ticker: 'NVDA',
      headline: 'NVIDIA Announces New AI Chip Architecture',
      summary: [
        'Next-generation H200 chip unveiled',
        '40% performance improvement over previous model',
        'Strong demand from cloud providers and AI startups'
      ],
      source: 'TechCrunch',
      time: '8h ago',
      severity: 'medium',
      portfolioImpact: 'Positive impact on 7.9% portfolio weight'
    },
    {
      id: '5',
      ticker: 'JPM',
      headline: 'JPMorgan Chase Reports Solid Q4 Earnings',
      summary: [
        'Net interest income increased 19% year-over-year',
        'Investment banking fees show recovery signs',
        'Credit quality remains strong despite economic uncertainty'
      ],
      source: 'Financial Times',
      time: '10h ago',
      severity: 'low',
      portfolioImpact: 'Neutral impact on 6.4% portfolio weight'
    },
    {
      id: '6',
      ticker: 'AMZN',
      headline: 'Amazon Web Services Launches New AI Services',
      summary: [
        'Bedrock AI platform now generally available',
        'Integration with popular AI models expanded',
        'Enterprise adoption accelerating in healthcare and finance'
      ],
      source: 'AWS Blog',
      time: '12h ago',
      severity: 'medium',
      portfolioImpact: 'Positive impact on 9.3% portfolio weight'
    }
  ];

  const filteredNews = newsItems.filter(item => {
    // Filter by range (simplified for demo)
    if (selectedRange === 'Today') return true;
    if (selectedRange === '3 Days') return true;
    if (selectedRange === 'Week') return true;
    return true;
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
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

  const getSeverityLabel = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'High Impact';
      case 'medium':
        return 'Medium Impact';
      case 'low':
        return 'Low Impact';
      default:
        return 'Unknown';
    }
  };

  const formatTime = (timeString: string) => {
    return timeString;
  };

  return (
          <div className="bg-[#FCFCFC] rounded-3xl shadow-lg border border-slate-300/50 p-6">
      {/* Header */}
                              <div className="flex items-center justify-between mb-6">
                                                 <h2 className="text-xl font-bold text-[#1B263B] tracking-tight">
                   News
                 </h2>
        <div className="flex items-center gap-2">
          {/* Range Selector */}
          <div className="flex bg-[#F8F9FA] rounded-lg p-1">
            {(['Today', '3 Days', 'Week'] as const).map((range) => (
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
        {(['Holdings', 'Watchlist', 'High relevance'] as const).map((filter) => (
          <button
            key={filter}
            onClick={() => setSelectedFilter(filter)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              selectedFilter === filter
                ? 'bg-[#3A86FF] text-white'
                : 'bg-[#F8F9FA] text-[#495057] hover:bg-[#E9ECEF]'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* News List */}
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {filteredNews.length === 0 ? (
          <div className="text-center py-8 text-[#495057]">
            <Newspaper className="w-12 h-12 mx-auto mb-4 text-[#495057]/30" />
            <div className="text-lg font-medium mb-2 text-[#1B263B]">No relevant news</div>
            <div className="text-sm">No news found in this {selectedRange.toLowerCase()} range.</div>
          </div>
        ) : (
          filteredNews.map((item) => (
            <div
              key={item.id}
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
                      {getSeverityLabel(item.severity)}
                    </span>
                    <div className={`w-2 h-2 rounded-full ${getSeverityColor(item.severity)}`} />
                  </div>
                </div>
                
                <div className="text-right text-sm text-[#495057]">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatTime(item.time)}
                  </div>
                </div>
              </div>

              {/* Headline */}
              <h3 className="font-semibold text-[#1B263B] mb-3 text-lg">
                {item.headline}
              </h3>

              {/* Summary Bullets */}
              <div className="mb-3">
                {item.summary.map((bullet, index) => (
                  <div key={index} className="flex items-start gap-2 mb-2">
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-sm text-[#495057]">
                      {bullet}
                    </span>
                  </div>
                ))}
              </div>

              {/* Portfolio Impact */}
              <div className="mb-3 p-2 bg-[#F8F9FA] rounded border border-[#495057]/20">
                <div className="text-xs text-[#495057] font-medium">
                  Portfolio Impact: {item.portfolioImpact}
                </div>
              </div>

              {/* Meta Row */}
              <div className="flex items-center justify-between mb-3 text-xs text-slate-500 dark:text-slate-500">
                <div className="flex items-center gap-2">
                  <Building2 className="w-3 h-3" />
                  <span>{item.source}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{item.time}</span>
                </div>
              </div>

              {/* Action Chips */}
              <div className="flex flex-wrap gap-2">
                <button className="px-3 py-1 bg-slate-100 dark:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg text-xs hover:bg-slate-200 dark:hover:bg-slate-500 transition-colors">
                  Explain
                </button>
                <button className="px-3 py-1 bg-slate-100 dark:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg text-xs hover:bg-slate-200 dark:hover:bg-slate-500 transition-colors">
                  Summarize
                </button>
                <button className="px-3 py-1 bg-slate-100 dark:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg text-xs hover:bg-slate-200 dark:hover:bg-slate-500 transition-colors">
                  Open source
                </button>
                <button className="px-3 py-1 bg-slate-100 dark:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg text-xs hover:bg-slate-200 dark:hover:bg-slate-500 transition-colors">
                  Stress Test
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
