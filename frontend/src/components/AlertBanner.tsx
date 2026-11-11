import React from 'react';

interface AlertBannerProps {
  type: 'error' | 'success' | 'warning' | 'info';
  message: string;
  onClose: () => void;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({ type, message, onClose }) => {
  if (!message) return null;

  const bgStyles = {
    error: 'bg-rose-50/90 text-rose-900 border-rose-200',
    success: 'bg-emerald-50/90 text-emerald-900 border-emerald-200',
    warning: 'bg-amber-50/90 text-amber-900 border-amber-200',
    info: 'bg-slate-50 text-slate-900 border-slate-200',
  }[type];

  const dotColor = {
    error: 'bg-rose-500',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    info: 'bg-slate-700',
  }[type];

  return (
    <div className={`p-3.5 px-4 rounded-xl border mb-6 shadow-xs flex items-center justify-between gap-3 animate-sheet ${bgStyles}`}>
      <div className="flex items-center gap-2.5">
        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dotColor}`}></span>
        <span className="text-xs font-semibold leading-relaxed font-sans">{message}</span>
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
