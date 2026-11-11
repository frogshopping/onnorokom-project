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
      setError('ক্লাসের নাম দিন (যেমন: Class 6 - Morning Shift)।');
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
      setError(err.message || 'ক্লাস তৈরি করতে সমস্যা হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-800">নতুন ক্লাস ও শিফট যোগ করুন</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              ক্লাসের নাম ও শিফট <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Class 6 - Morning Shift"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
              required
            />
            <p className="mt-1 text-[11px] text-slate-400">প্রতিটি শিফট আলাদা ক্লাস হিসেবে তৈরি হবে।</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              মোট আসন সংখ্যা <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              min="1"
              max="10000"
              value={totalSeats}
              onChange={(e) => setTotalSeats(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
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
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition shadow-md shadow-blue-200 disabled:opacity-50"
            >
              {loading ? 'তৈরি হচ্ছে...' : 'ক্লাস সংরক্ষণ করুন'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

