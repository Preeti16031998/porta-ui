'use client';

import { useState } from 'react';
import { X, Plus, Loader2 } from 'lucide-react';

interface WatchlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function WatchlistModal({ isOpen, onClose, onSuccess }: WatchlistModalProps) {
  const [ticker, setTicker] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!ticker.trim()) return;

    setIsSubmitting(true);
    try {
      // Direct API call to match your exact endpoint format
      const createData = {
        user_id: "f00dc8bd-eabc-4143-b1f0-fbcb9715a02e",
        ticker: ticker.trim().toUpperCase(),
        note: notes.trim() || "",
      };
      
      console.log('Sending API request:', {
        url: 'http://localhost:8000/api/v1/watchlist/',
        data: createData
      });
      
      const response = await fetch('http://localhost:8000/api/v1/watchlist/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(createData),
      });

      console.log('API Response:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const responseData = await response.json();
      console.log('API Success Response:', responseData);

      // Reset form and close modal
      setTicker('');
      setNotes('');
      onSuccess();
    } catch (error) {
      console.error('Failed to add to watchlist:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Failed to add to watchlist: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setTicker('');
      setNotes('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#F1F3F4] rounded-xl shadow-2xl border border-[#495057]/10 w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#495057]/10">
          <h2 className="text-xl font-bold text-[#1B263B] tracking-tight">
            Add to Watchlist
          </h2>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="p-2 hover:bg-[#495057]/10 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-[#495057]" />
          </button>
        </div>

        {/* Form */}
        <div className="p-5 space-y-4">
          {/* Ticker Input */}
          <div>
            <label className="block text-sm font-medium text-[#1B263B] mb-2">
              Ticker Symbol *
            </label>
            <input
              type="text"
              value={ticker}
              onChange={(e) => setTicker(e.target.value)}
              placeholder="Enter ticker (e.g., AAPL, MSFT)"
              className="w-full px-3 py-2 bg-white border border-[#495057]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3A86FF] focus:border-transparent text-[#1B263B]"
              disabled={isSubmitting}
            />
          </div>

          {/* Notes Input */}
          <div>
            <label className="block text-sm font-medium text-[#1B263B] mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about this stock..."
              rows={3}
              className="w-full px-3 py-2 bg-white border border-[#495057]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3A86FF] focus:border-transparent text-[#1B263B] resize-none"
              disabled={isSubmitting}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-5 flex justify-end gap-3 border-t border-[#495057]/10">
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-[#495057] hover:bg-[#495057]/10 rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!ticker.trim() || isSubmitting}
            className="flex items-center gap-2 px-4 py-2 bg-[#1B263B] hover:bg-[#1B263B]/90 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Add to Watchlist
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
