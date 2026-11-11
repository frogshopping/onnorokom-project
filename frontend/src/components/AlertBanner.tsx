import React from 'react';

interface AlertBannerProps {
  type: 'error' | 'success' | 'warning' | 'info';
  message: string;
  onClose: () => void;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({ type, message, onClose }) => {
  if (!message) return null;

  const bgStyles = {
    error: 'bg-rose-50 border-rose-200 text-rose-800',
    success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    warning: 'bg-amber-50 border-amber-200 text-amber-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800'
  }[type];

  const iconColor = {
    error: 'text-rose-500',
    success: 'text-emerald-500',
    warning: 'text-amber-500',
    info: 'text-blue-500'
  }[type];

  return (
    <div className={`p-4 rounded-xl border mb-6 shadow-sm flex items-start justify-between gap-3 ${bgStyles}`}>
      <div className="flex items-start gap-3">
        <svg className={`w-5 h-5 mt-0.5 flex-shrink-0 ${iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {type === 'error' && (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          )}
          {type === 'success' && (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          )}
          {(type === 'warning' || type === 'info') && (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          )}
        </svg>
        <span className="text-sm font-medium leading-relaxed">{message}</span>
      </div>
      <button
        onClick={onClose}
        className="text-slate-400 hover:text-slate-700 rounded-lg p-1 transition"
        title="বন্ধ করুন"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

