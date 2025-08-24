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
      <div className="bg-[#FCFCFC] rounded-3xl shadow-lg border border-slate-300/50 max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-300/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#1B263B]/10 rounded-lg flex items-center justify-center">
              {editItem ? <Edit className="w-4 h-4 text-[#1B263B]" /> : <Plus className="w-4 h-4 text-[#1B263B]" />}
            </div>
            <div>
                                                     <h3 className="text-xl font-bold text-[#1B263B] tracking-tight">
               {editItem ? 'Edit Holding' : 'Add New Holding'}
             </h3>
              <p className="text-sm text-[#495057]">
                {editItem ? 'Update your portfolio position' : 'Add a new stock to your portfolio'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#495057]/10 rounded-lg transition-colors"
          >
            <X className="w-4 h-4 text-[#495057]" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="bg-[#E63946]/10 border border-[#E63946]/20 rounded-lg p-3">
              <p className="text-[#E63946] text-sm">{error}</p>
            </div>
          )}

          {/* Ticker */}
          <div>
            <label htmlFor="ticker" className="block text-sm font-medium text-[#1B263B] mb-2">
              Stock Ticker *
            </label>
            <input
              type="text"
              id="ticker"
              value={ticker}
              onChange={(e) => setTicker(e.target.value)}
              placeholder="e.g., AAPL"
              className="w-full px-3 py-2 bg-white border border-[#495057]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3A86FF] focus:border-transparent text-[#1B263B]"
              disabled={editItem !== null} // Can't change ticker for existing holdings
            />
          </div>

          {/* Quantity */}
          <div>
            <label htmlFor="quantity" className="block text-sm font-medium text-[#1B263B] mb-2">
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
              className="w-full px-3 py-2 bg-white border border-[#495057]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3A86FF] focus:border-transparent text-[#1B263B]"
            />
          </div>

          {/* Buy Price */}
          <div>
            <label htmlFor="buyPrice" className="block text-sm font-medium text-[#1B263B] mb-2">
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
              className="w-full px-3 py-2 bg-white border border-[#495057]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3A86FF] focus:border-transparent text-[#1B263B]"
            />
          </div>

          {/* Note */}
          <div>
            <label htmlFor="note" className="block text-sm font-medium text-[#1B263B] mb-2">
              Note (Optional)
            </label>
                          <textarea
                id="note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g., Bought during market dip, long-term hold"
                rows={3}
                className="w-full px-3 py-2 bg-white border border-[#495057]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3A86FF] focus:border-transparent text-[#1B263B] resize-none"
              />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-[#495057]/10 text-[#495057] rounded-lg hover:bg-[#495057]/20 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !ticker.trim() || !quantity.trim() || !buyPrice.trim()}
              className="flex-1 px-4 py-2 bg-[#1B263B] hover:bg-[#1B263B]/90 disabled:bg-[#495057] text-white rounded-lg transition-colors flex items-center justify-center gap-2"
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
