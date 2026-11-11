import React, { useState } from 'react';

interface CreateClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string, totalSeats: number) => Promise<void>;
}

export const CreateClassModal: React.FC<CreateClassModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState('');
  const [totalSeats, setTotalSeats] = useState<number | ''>(60);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('শ্রেণির নাম ও শিফট দিন (যেমন: Class 6 - Morning Shift)।');
      return;
    }

    if (!totalSeats || Number(totalSeats) <= 0) {
      setError('আসন সংখ্যা কমপক্ষে ১ হতে হবে।');
      return;
    }

    try {
      setLoading(true);
      await onSubmit(name.trim(), Number(totalSeats));
      setName('');
      setTotalSeats(60);
      onClose();
    } catch (err: any) {
      setError(err.message || 'ক্লাস তৈরি করতে সমস্যা হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-sheet">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-400 block mb-0.5">
              ADMINISTRATIVE PANEL
            </span>
            <h3 className="text-base font-bold text-slate-900 font-bangla">নতুন ক্লাস ও শিফট কনফিগারেশন</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1.5 font-sans">
              শ্রেণির নাম ও শিফট <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Class 6 - Morning Shift"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-slate-100 focus:border-slate-800 font-medium"
              required
            />
            <p className="mt-1 text-[11px] text-slate-400 font-sans">
              প্রতিটি শিফটকে একটি স্বয়ংসম্পূর্ণ ক্লাস হিসেবে ডাটাবেসে সেভ করা হবে।
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1.5 font-sans">
              মোট বরাদ্দকৃত আসন সংখ্যা <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              min="1"
              max="10000"
              value={totalSeats}
              onChange={(e) => setTotalSeats(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
              className="w-full px-3.5 py-2.5 text-xs font-mono rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-slate-100 focus:border-slate-800"
              required
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition shadow-sm disabled:opacity-50"
            >
              {loading ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করুন'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
