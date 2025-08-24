'use client';

import { useState, useEffect } from 'react';
import { X, Save, User, Target, TrendingUp, Shield, MessageSquare, Clock, Building2 } from 'lucide-react';
import { useUserId } from '@/hooks/useUser';

interface UserPreferences {
  user_id: string;
  experience_level: string;
  investment_style: string;
  risk_tolerance: string;
  communication_style: string;
  preferred_sectors: string[];
  preferred_timeframe: string;
  preferred_asset_classes: string[];
  investment_goals: string[];
  language: string;
  currency: string;
  timezone?: string;
  created_at?: string;
  updated_at?: string;
}

interface UserPreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const UserPreferencesModal = ({ isOpen, onClose }: UserPreferencesModalProps) => {
  const userId = useUserId();
  const [preferences, setPreferences] = useState<UserPreferences>({
    user_id: '',
    experience_level: 'intermediate',
    investment_style: 'moderate',
    risk_tolerance: 'medium',
    communication_style: 'simple',
    preferred_sectors: [],
    preferred_timeframe: 'medium_term',
    preferred_asset_classes: [],
    investment_goals: [],
    language: 'en',
    currency: 'USD',
    timezone: 'UTC'
  });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  // Load existing preferences when modal opens
  useEffect(() => {
    if (isOpen && userId) {
      loadPreferences();
    }
  }, [isOpen, userId]);

  const loadPreferences = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/v1/user-preferences/${userId}`);
      if (response.ok) {
        const data = await response.json();
        console.log('Loaded preferences data:', data);
        setPreferences({ ...data, user_id: userId });
      } else if (response.status === 404) {
        // Handle 404 gracefully - user preferences don't exist yet, which is fine
        console.log('No existing preferences found for user, starting with defaults');
        // Keep the default preferences that are already set in state
      } else {
        // Only log errors for non-404 status codes
        console.error('Failed to load preferences:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Network error loading preferences:', error);
    }
  };

  const savePreferences = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      // Check if preferences already exist for this user
      const checkResponse = await fetch(`http://localhost:8000/api/v1/user-preferences/${userId}`);
      const preferencesExist = checkResponse.ok;
      
      let response;
      if (preferencesExist) {
        // Update existing preferences
        response = await fetch(`http://localhost:8000/api/v1/user-preferences/${userId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            experience_level: preferences.experience_level,
            investment_style: preferences.investment_style,
            risk_tolerance: preferences.risk_tolerance,
            communication_style: preferences.communication_style,
            preferred_sectors: preferences.preferred_sectors,
            investment_goals: preferences.investment_goals,
            preferred_timeframe: preferences.preferred_timeframe,
            preferred_asset_classes: preferences.preferred_asset_classes,
            language: preferences.language,
            currency: preferences.currency,
            timezone: preferences.timezone
          }),
        });
      } else {
        // Create new preferences
        response = await fetch(`http://localhost:8000/api/v1/user-preferences/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...preferences,
            user_id: userId
          }),
        });
      }

      if (response.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } else {
        const errorData = await response.json();
        console.error('Failed to save preferences:', errorData);
      }
    } catch (error) {
      console.error('Failed to save preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePreferenceChange = (field: keyof UserPreferences, value: any) => {
    setPreferences(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayChange = (field: keyof UserPreferences, value: string, checked: boolean) => {
    setPreferences(prev => ({
      ...prev,
      [field]: checked 
        ? [...(prev[field] as string[] || []), value]
        : (prev[field] as string[] || []).filter(item => item !== value)
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#1B263B]/10 rounded-xl flex items-center justify-center">
              <User className="w-5 h-5 text-[#1B263B]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#1B263B] tracking-tight">
                User Preferences
              </h2>
              <p className="text-sm text-gray-600">
                Customize your Porta experience
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-8">
          {/* Experience & Investment Style */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-[#1B263B] mb-3">
                <div className="flex items-center gap-2 mb-1">
                  <User className="w-4 h-4" />
                  Experience Level
                </div>
              </label>
              <select
                value={preferences.experience_level}
                onChange={(e) => handlePreferenceChange('experience_level', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3A86FF] focus:border-transparent"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="expert">Expert</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1B263B] mb-3">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4" />
                  Investment Style
                </div>
              </label>
              <select
                value={preferences.investment_style}
                onChange={(e) => handlePreferenceChange('investment_style', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3A86FF] focus:border-transparent"
              >
                <option value="conservative">Conservative</option>
                <option value="moderate">Moderate</option>
                <option value="aggressive">Aggressive</option>
                <option value="day_trader">Day Trader</option>
                <option value="swing_trader">Swing Trader</option>
                <option value="long_term">Long Term</option>
              </select>
            </div>
          </div>

          {/* Risk Tolerance & Communication Style */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-[#1B263B] mb-3">
                <div className="flex items-center gap-2 mb-1">
                  <Shield className="w-4 h-4" />
                  Risk Tolerance
                </div>
              </label>
              <select
                value={preferences.risk_tolerance}
                onChange={(e) => handlePreferenceChange('risk_tolerance', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3A86FF] focus:border-transparent"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1B263B] mb-3">
                <div className="flex items-center gap-2 mb-1">
                  <MessageSquare className="w-4 h-4" />
                  Communication Style
                </div>
              </label>
              <select
                value={preferences.communication_style}
                onChange={(e) => handlePreferenceChange('communication_style', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3A86FF] focus:border-transparent"
              >
                <option value="simple">Simple</option>
                <option value="technical">Technical</option>
                <option value="detailed">Detailed</option>
              </select>
            </div>
          </div>

          {/* Preferred Sectors */}
          <div>
            <label className="block text-sm font-medium text-[#1B263B] mb-3">
              <div className="flex items-center gap-2 mb-1">
                <Building2 className="w-4 h-4" />
                Preferred Sectors
              </div>
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                'Technology', 'Healthcare', 'Energy', 'Finance', 'Consumer', 'Real Estate', 'Materials', 'Utilities',
                'Communication Services', 'Industrials', 'Consumer Discretionary', 'Consumer Staples', 'Information Technology',
                'Financial Services', 'Basic Materials', 'Transportation', 'Aerospace', 'Defense', 'Biotechnology'
              ].map((sector) => (
                <label key={sector} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.preferred_sectors?.includes(sector.toLowerCase().replace(' ', '_')) || false}
                    onChange={(e) => handleArrayChange('preferred_sectors', sector.toLowerCase().replace(' ', '_'), e.target.checked)}
                    className="w-4 h-4 text-[#1B263B] border-gray-300 rounded focus:ring-[#3A86FF]"
                  />
                  <span className="text-sm text-gray-700">{sector}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Investment Goals */}
          <div>
            <label className="block text-sm font-medium text-[#1B263B] mb-3">
              <div className="flex items-center gap-2 mb-1">
                <Target className="w-4 h-4" />
                Investment Goals
              </div>
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                'retirement', 'income_generation', 'wealth_building', 'tax_optimization', 'capital_preservation', 'early_retirement',
                'education_funding', 'home_purchase', 'business_investment', 'philanthropy', 'legacy_planning', 'debt_reduction'
              ].map((goal) => (
                <label key={goal} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.investment_goals?.includes(goal) || false}
                    onChange={(e) => handleArrayChange('investment_goals', goal, e.target.checked)}
                    className="w-4 h-4 text-[#1B263B] border-gray-300 rounded focus:ring-[#3A86FF]"
                  />
                  <span className="text-sm text-gray-700">{goal.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Preferred Timeframe & Asset Classes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-[#1B263B] mb-3">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-4 h-4" />
                  Preferred Timeframe
                </div>
              </label>
              <select
                value={preferences.preferred_timeframe}
                onChange={(e) => handlePreferenceChange('preferred_timeframe', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3A86FF] focus:border-transparent"
              >
                <option value="short_term">Short-term (&lt;1 year)</option>
                <option value="medium_term">Medium-term (1-5 years)</option>
                <option value="long_term">Long-term (5+ years)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1B263B] mb-3">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4" />
                  Preferred Asset Classes
                </div>
              </label>
              <div className="space-y-2">
                {[
                  'stocks', 'bonds', 'etfs', 'mutual_funds', 'real_estate', 'commodities', 'cryptocurrency',
                  'options', 'futures', 'forex', 'private_equity', 'venture_capital', 'hedge_funds', 'reits'
                ].map((asset) => (
                  <label key={asset} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.preferred_asset_classes?.includes(asset) || false}
                      onChange={(e) => handleArrayChange('preferred_asset_classes', asset, e.target.checked)}
                      className="w-3 h-3 text-[#1B263B] border-gray-300 rounded focus:ring-[#3A86FF]"
                    />
                    <span className="text-sm text-gray-700">{asset.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Language & Currency */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-[#1B263B] mb-3">
                Language
              </label>
              <select
                value={preferences.language}
                onChange={(e) => handlePreferenceChange('language', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3A86FF] focus:border-transparent"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
                <option value="it">Italian</option>
                <option value="pt">Portuguese</option>
                <option value="ru">Russian</option>
                <option value="zh">Chinese</option>
                <option value="ja">Japanese</option>
                <option value="ko">Korean</option>
                <option value="ar">Arabic</option>
                <option value="hi">Hindi</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1B263B] mb-3">
                Currency
              </label>
              <select
                value={preferences.currency}
                onChange={(e) => handlePreferenceChange('currency', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3A86FF] focus:border-transparent"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="JPY">JPY (¥)</option>
                <option value="CAD">CAD (C$)</option>
                <option value="AUD">AUD (A$)</option>
                <option value="CHF">CHF (CHF)</option>
                <option value="CNY">CNY (¥)</option>
                <option value="INR">INR (₹)</option>
                <option value="BRL">BRL (R$)</option>
                <option value="MXN">MXN ($)</option>
                <option value="KRW">KRW (₩)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1B263B] mb-3">
                Timezone
              </label>
              <select
                value={preferences.timezone}
                onChange={(e) => handlePreferenceChange('timezone', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3A86FF] focus:border-transparent"
              >
                <option value="UTC">UTC</option>
                <option value="America/New_York">Eastern Time</option>
                <option value="America/Chicago">Central Time</option>
                <option value="America/Denver">Mountain Time</option>
                <option value="America/Los_Angeles">Pacific Time</option>
                <option value="Europe/London">London</option>
                <option value="Asia/Tokyo">Tokyo</option>
              </select>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
          <div className="text-sm text-gray-600">
            {saved && (
              <span className="text-green-600 font-medium">✓ Preferences saved successfully!</span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={savePreferences}
              disabled={loading}
              className="px-6 py-2 bg-[#1B263B] hover:bg-[#1B263B]/90 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {loading ? 'Saving...' : 'Save Preferences'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserPreferencesModal;
