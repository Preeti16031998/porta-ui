'use client';

import { useState } from 'react';
import { Search, X, Plus, Building2 } from 'lucide-react';

interface Company {
  ticker: string;
  name: string;
  sector: string;
  marketCap: string;
}

interface HoldingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HoldingsModal({ isOpen, onClose }: HoldingsModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  const companies: Company[] = [
    { ticker: 'META', name: 'Meta Platforms Inc.', sector: 'Technology', marketCap: '1.2T' },
    { ticker: 'NFLX', name: 'Netflix Inc.', sector: 'Communication Services', marketCap: '280B' },
    { ticker: 'ADBE', name: 'Adobe Inc.', sector: 'Technology', marketCap: '220B' },
    { ticker: 'CRM', name: 'Salesforce Inc.', sector: 'Technology', marketCap: '240B' },
    { ticker: 'ORCL', name: 'Oracle Corp.', sector: 'Technology', marketCap: '320B' },
    { ticker: 'INTC', name: 'Intel Corp.', sector: 'Technology', marketCap: '180B' },
    { ticker: 'AMD', name: 'Advanced Micro Devices', sector: 'Technology', marketCap: '280B' },
    { ticker: 'QCOM', name: 'Qualcomm Inc.', sector: 'Technology', marketCap: '190B' },
    { ticker: 'TXN', name: 'Texas Instruments', sector: 'Technology', marketCap: '160B' },
    { ticker: 'AVGO', name: 'Broadcom Inc.', sector: 'Technology', marketCap: '580B' },
  ];

  const filteredCompanies = companies.filter(company =>
    company.ticker.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddCompany = (company: Company) => {
    setSelectedCompany(company);
    // Here you would typically add the company to the portfolio
    // For now, we'll just show a success message
    setTimeout(() => {
      onClose();
      setSelectedCompany(null);
      setSearchTerm('');
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-2xl max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            Add Company to Portfolio
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Search */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search companies by ticker or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Companies List */}
        <div className="p-6 max-h-96 overflow-y-auto">
          {filteredCompanies.length === 0 ? (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              No companies found matching "{searchTerm}"
            </div>
          ) : (
            <div className="space-y-3">
              {filteredCompanies.map((company) => (
                <div
                  key={company.ticker}
                  className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {company.ticker}
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        {company.name}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-500">
                        {company.sector} • {company.marketCap}
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleAddCompany(company)}
                    className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Success Message */}
        {selectedCompany && (
          <div className="p-6 bg-green-50 dark:bg-green-900/20 border-t border-green-200 dark:border-green-800">
            <div className="text-center text-green-800 dark:text-green-200">
              <div className="font-semibold mb-2">
                Added {selectedCompany.ticker} to your portfolio!
              </div>
              <div className="text-sm">
                The company has been added successfully.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
