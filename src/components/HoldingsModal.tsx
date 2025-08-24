'use client';

import { useState, useEffect } from 'react';
import { X, Plus, Edit } from 'lucide-react';
import { PortfolioItem, CreatePortfolioRequest, UpdatePortfolioRequest } from '@/services/api';

interface HoldingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editItem?: PortfolioItem | null;
}

export default function HoldingsModal({ isOpen, onClose, onSuccess, editItem }: HoldingsModalProps) {
  const [ticker, setTicker] = useState('');
  const [quantity, setQuantity] = useState('');
  const [buyPrice, setBuyPrice] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const userId = process.env.NEXT_PUBLIC_USER_ID || 'f00dc8bd-eabc-4143-b1f0-fbcb9715a02e';

  // Reset form when modal opens/closes or editItem changes
  useEffect(() => {
    if (isOpen) {
      if (editItem) {
        setTicker(editItem.ticker);
        setQuantity(editItem.quantity);
        setBuyPrice(editItem.buy_price);
        setNote(editItem.note || '');
      } else {
        setTicker('');
        setQuantity('');
        setBuyPrice('');
        setNote('');
      }
      setError(null);
    }
  }, [isOpen, editItem]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!ticker.trim() || !quantity.trim() || !buyPrice.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (editItem) {
        // Update existing holding
        const updateData: UpdatePortfolioRequest = {
          quantity,
          buy_price: buyPrice,
          note: note.trim() || undefined,
        };

        const response = await fetch(`http://localhost:8000/api/v1/portfolio/${editItem.portfolio_id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updateData),
        });

        if (!response.ok) {
          throw new Error(`Failed to update holding: ${response.statusText}`);
        }
      } else {
        // Create new holding
        const createData: CreatePortfolioRequest = {
          user_id: userId,
          ticker: ticker.trim().toUpperCase(),
          quantity,
          buy_price: buyPrice,
          note: note.trim() || undefined,
        };

        const response = await fetch('http://localhost:8000/api/v1/portfolio/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(createData),
        });

        if (!response.ok) {
          throw new Error(`Failed to create holding: ${response.statusText}`);
        }
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error('Holdings modal error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              {editItem ? <Edit className="w-4 h-4 text-blue-600 dark:text-blue-400" /> : <Plus className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white">
                {editItem ? 'Edit Holding' : 'Add New Holding'}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {editItem ? 'Update your portfolio position' : 'Add a new stock to your portfolio'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {/* Ticker */}
          <div>
            <label htmlFor="ticker" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Stock Ticker *
            </label>
            <input
              type="text"
              id="ticker"
              value={ticker}
              onChange={(e) => setTicker(e.target.value)}
              placeholder="e.g., AAPL"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={editItem !== null} // Can't change ticker for existing holdings
            />
          </div>

          {/* Quantity */}
          <div>
            <label htmlFor="quantity" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Quantity *
            </label>
            <input
              type="number"
              id="quantity"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="e.g., 100"
              step="0.0001"
              min="0"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Buy Price */}
          <div>
            <label htmlFor="buyPrice" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Buy Price per Share *
            </label>
            <input
              type="number"
              id="buyPrice"
              value={buyPrice}
              onChange={(e) => setBuyPrice(e.target.value)}
              placeholder="e.g., 150.00"
              step="0.01"
              min="0"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Note */}
          <div>
            <label htmlFor="note" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Note (Optional)
            </label>
            <textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g., Bought during market dip, long-term hold"
              rows={3}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !ticker.trim() || !quantity.trim() || !buyPrice.trim()}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {editItem ? 'Updating...' : 'Adding...'}
                </>
              ) : (
                editItem ? 'Update Holding' : 'Add Holding'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
