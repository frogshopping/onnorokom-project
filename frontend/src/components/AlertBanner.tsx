import React from 'react';

interface AlertBannerProps {
  type: 'error' | 'success' | 'warning' | 'info';
  message: string;
  onClose: () => void;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({ type, message, onClose }) => {
  if (!message) return null;

  const bgStyles = {
    error: 'bg-rose-950/90 text-rose-100 border-rose-800 shadow-rose-950/20',
    success: 'bg-slate-900 text-white border-slate-800 shadow-slate-900/20',
    warning: 'bg-amber-950/90 text-amber-100 border-amber-800 shadow-amber-950/20',
    info: 'bg-slate-900 text-white border-slate-800 shadow-slate-900/20',
  }[type];

  const dotColor = {
    error: 'bg-rose-400',
    success: 'bg-emerald-400',
    warning: 'bg-amber-400',
    info: 'bg-blue-400',
  }[type];

  return (
    <div className={`p-3.5 px-4 rounded-2xl border mb-6 shadow-lg backdrop-blur-md flex items-center justify-between gap-3 animate-sheet ${bgStyles}`}>
      <div className="flex items-center gap-3">
        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dotColor}`}></span>
        <span className="text-xs font-medium leading-relaxed font-sans">{message}</span>
      </div>
      <button
        onClick={onClose}
        className="text-white/60 hover:text-white rounded-lg p-1 transition"
        title="বন্ধ করুন"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};
