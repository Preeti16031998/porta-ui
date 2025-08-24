'use client';

import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { RefreshCw, TrendingUp, TrendingDown } from 'lucide-react';

interface SectorData {
  name: string;
  weight: number;
  return: number;
  color: string;
}

interface PerformanceData {
  sector: string;
  return: number;
  color: string;
}

export default function IndustryInsights() {
  const [selectedRange, setSelectedRange] = useState<'1H' | 'Today' | 'Week' | 'Month'>('Today');
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [selectedSector, setSelectedSector] = useState<string | null>(null);

  const sectorData: SectorData[] = [
    { name: 'Technology', weight: 44.2, return: -0.8, color: '#3B82F6' },
    { name: 'Financial Services', weight: 30.1, return: 1.2, color: '#10B981' },
    { name: 'Healthcare', weight: 15.8, return: 0.5, color: '#8B5CF6' },
    { name: 'Consumer Discretionary', weight: 9.9, return: -1.5, color: '#F59E0B' },
  ];

  const performanceData: PerformanceData[] = sectorData.map(sector => ({
    sector: sector.name,
    return: sector.return,
    color: sector.color,
  }));

  const messages = [
    "Tech sector (-0.8%) is driving most of today's portfolio decline.",
    "Healthcare cushioned today's loss (+0.5%).",
    "Financial Services contributed the most gains this week (+1.2%).",
    "Your Consumer Discretionary holdings (-1.5%) are the biggest drag on performance today.",
    "Compared to the S&P 500, your portfolio is more overweight in Technology (+12%).",
    "Energy sector volatility is impacting overall portfolio stability.",
    "Your balanced sector allocation is helping manage today's market volatility.",
    "Technology stocks are showing signs of recovery after morning losses.",
    "Financial sector strength is providing portfolio support today.",
    "Healthcare sector continues to show defensive characteristics.",
  ];

  // Rotate messages every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % messages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [messages.length]);

  const handleSectorClick = (sector: string) => {
    setSelectedSector(sector);
    // Here you would typically filter other components or update AI context
  };

  const getMessageColor = (message: string) => {
    if (message.includes('-')) return 'text-red-600 dark:text-red-400';
    if (message.includes('+')) return 'text-green-600 dark:text-green-400';
    return 'text-slate-600 dark:text-slate-400';
  };

  const formatPercent = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  return (
    <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200/50 dark:border-slate-700/50 p-6">
      {/* Header with Range Selector */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
          Industry Insights
        </h2>
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
            {(['1H', 'Today', 'Week', 'Month'] as const).map((range) => (
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Donut Chart */}
        <div>
          <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-4 text-center">
            Allocation
          </h3>
          <div className="relative">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={sectorData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="weight"
                  onClick={(data) => handleSectorClick(data.name)}
                  className="cursor-pointer"
                >
                  {sectorData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [`${value.toFixed(1)}%`, 'Weight']}
                  labelFormatter={(label) => `${label} Sector`}
                />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Center Annotation */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <div className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Top sector:
                </div>
                <div className="text-lg font-bold text-slate-900 dark:text-white">
                  {sectorData[0].name}
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-500">
                  {sectorData[0].weight.toFixed(1)}%
                </div>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap justify-center gap-3 mt-4">
            {sectorData.map((sector) => (
              <div key={sector.name} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: sector.color }}
                />
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  {sector.name} {sector.weight.toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Performance and AI Message */}
        <div className="space-y-6">
          {/* Performance Mini-Chart */}
          <div>
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-4">
              Performance ({selectedRange})
            </h3>
            <ResponsiveContainer width="100%" height={120}>
              <BarChart data={performanceData} layout="horizontal">
                <XAxis type="number" domain={[-2, 2]} />
                <YAxis dataKey="sector" type="category" width={80} />
                <Tooltip
                  formatter={(value: number) => [formatPercent(value), 'Return']}
                  labelFormatter={(label) => `${label} Sector`}
                />
                <Bar dataKey="return" radius={[0, 4, 4, 0]}>
                  {performanceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* AI Message */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4 border border-blue-200/50 dark:border-blue-700/50">
            <div className="flex items-start justify-between mb-3">
              <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100">
                AI Insight
              </h4>
              <button
                onClick={() => setCurrentMessageIndex((prev) => (prev + 1) % messages.length)}
                className="p-1 hover:bg-blue-100 dark:hover:bg-blue-800 rounded transition-colors"
              >
                <RefreshCw className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </button>
            </div>
            <p className={`text-sm leading-relaxed ${getMessageColor(messages[currentMessageIndex])}`}>
              {messages[currentMessageIndex]}
            </p>
            <div className="mt-3 text-xs text-blue-600 dark:text-blue-400">
              Auto-updates every 5 seconds
            </div>
          </div>
        </div>
      </div>

      {/* Selected Sector Info */}
      {selectedSector && (
        <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
          <div className="text-center">
            <div className="text-sm text-slate-600 dark:text-slate-400 mb-2">
              Selected Sector:
            </div>
            <div className="text-lg font-semibold text-slate-900 dark:text-white">
              {selectedSector}
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-500">
              Click to filter other components and update AI context
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
