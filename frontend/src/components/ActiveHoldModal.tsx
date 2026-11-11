import React, { useEffect, useState } from 'react';
import { ActiveHoldState } from '../types';

interface ActiveHoldModalProps {
  activeHold: ActiveHoldState | null;
  studentId: string;
  onConfirm: (holdId: string) => Promise<void>;
  onCancel: (holdId: string) => Promise<void>;
  onClose: () => void;
}

export const ActiveHoldModal: React.FC<ActiveHoldModalProps> = ({
  activeHold,
  studentId,
  onConfirm,
  onCancel,
  onClose,
}) => {
  if (!activeHold) return null;

  const [timeLeft, setTimeLeft] = useState<number>(() => {
    const remaining = Math.floor((new Date(activeHold.expiresAt).getTime() - Date.now()) / 1000);
    return Math.max(0, remaining);
  });
  const [currentStatus, setCurrentStatus] = useState<string>(activeHold.status);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync state when activeHold updates
  useEffect(() => {
    setCurrentStatus(activeHold.status);
    const remaining = Math.floor((new Date(activeHold.expiresAt).getTime() - Date.now()) / 1000);
    setTimeLeft(Math.max(0, remaining));
  }, [activeHold]);

  // Live Countdown Timer (Rule 9)
  useEffect(() => {
    if (currentStatus !== 'HELD') return;

    const interval = setInterval(() => {
      const remaining = Math.floor((new Date(activeHold.expiresAt).getTime() - Date.now()) / 1000);
      if (remaining <= 0) {
        setTimeLeft(0);
        setCurrentStatus('EXPIRED'); // Immediately transition to EXPIRED without page reload
        clearInterval(interval);
      } else {
        setTimeLeft(remaining);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [activeHold.expiresAt, currentStatus]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const isExpired = currentStatus === 'EXPIRED' || timeLeft <= 0;
  const isConfirmed = currentStatus === 'CONFIRMED';
  const isCancelled = currentStatus === 'CANCELLED';

  const handleConfirm = async () => {
    if (isExpired || isConfirmed) return;
    setError(null);
    try {
      setLoading(true);
      await onConfirm(activeHold.holdId);
      setCurrentStatus('CONFIRMED');
    } catch (err: any) {
      setError(err.message || 'ভর্তি নিশ্চিত করতে সমস্যা হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (isConfirmed) return;
    setError(null);
    try {
      setLoading(true);
      await onCancel(activeHold.holdId);
      setCurrentStatus('CANCELLED');
    } catch (err: any) {
      setError(err.message || 'আবেদন বাতিল করতে সমস্যা হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">আবেদন বিবরণ</span>
            <h3 className="text-lg font-bold text-slate-800">{activeHold.className}</h3>
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
          <div className="mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Content Details */}
        <div className="mt-5 space-y-4">
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-500 block mb-0.5">আবেদন / Hold ID</span>
              <span className="font-mono font-bold text-slate-800">{activeHold.holdId}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-500 block mb-0.5">শিক্ষার্থীর আইডি</span>
              <span className="font-mono font-bold text-slate-800">{studentId}</span>
            </div>
          </div>

          {/* Status & Countdown Box */}
          <div
            className={`p-5 rounded-2xl border text-center transition-colors ${
              isConfirmed
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : isExpired
                ? 'bg-rose-50 border-rose-200 text-rose-800'
                : isCancelled
                ? 'bg-slate-100 border-slate-200 text-slate-700'
                : 'bg-amber-50/80 border-amber-200 text-amber-900'
            }`}
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  isConfirmed
                    ? 'bg-emerald-200 text-emerald-900'
                    : isExpired
                    ? 'bg-rose-200 text-rose-900'
                    : isCancelled
                    ? 'bg-slate-300 text-slate-800'
                    : 'bg-amber-200 text-amber-950 animate-pulse'
                }`}
              >
                {currentStatus}
              </span>
            </div>

            {currentStatus === 'HELD' && (
              <div>
                <p className="text-xs text-amber-700 font-medium mb-1">সিট ধরে রাখার অবশিষ্ট সময়:</p>
                <div className="text-3xl font-extrabold font-mono text-amber-900 tracking-wider">
                  {formattedTime}
                </div>
                <p className="text-[11px] text-amber-600 mt-1">
                  এই সময়ের মধ্যে ফি জমা না দিলে সিটটি অন্যদের জন্য উন্মুক্ত হয়ে যাবে।
                </p>
              </div>
            )}

            {isConfirmed && (
              <div className="py-2">
                <svg className="w-12 h-12 text-emerald-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h4 className="text-base font-bold text-emerald-900">ভর্তি সফলভাবে নিশ্চিত হয়েছে!</h4>
                <p className="text-xs text-emerald-700 mt-0.5">আপনার আবেদন এবং ফি গ্রহণ সম্পন্ন হয়েছে।</p>
              </div>
            )}

            {isExpired && (
              <div className="py-2">
                <h4 className="text-base font-bold text-rose-900">আবেদনের মেয়াদ শেষ হয়ে গেছে!</h4>
                <p className="text-xs text-rose-700 mt-0.5">সিটটি পুনরায় সাধারণ তালিকার জন্য উন্মুক্ত করা হয়েছে।</p>
              </div>
            )}

            {isCancelled && (
              <div className="py-2">
                <h4 className="text-base font-bold text-slate-800">আবেদনটি বাতিল করা হয়েছে</h4>
                <p className="text-xs text-slate-600 mt-0.5">আপনি চাইলে অন্য কোনো ক্লাসে আবেদন করতে পারেন।</p>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
          {!isConfirmed && !isExpired && !isCancelled && (
            <button
              onClick={handleCancel}
              disabled={loading}
              className="px-4 py-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition border border-rose-200 disabled:opacity-50"
            >
              আবেদন বাতিল
            </button>
          )}

          {!isConfirmed && (
            <button
              onClick={handleConfirm}
              disabled={isExpired || isCancelled || loading}
              title={isExpired ? 'মেয়াদ শেষ হওয়ায় ফি দেওয়া সম্ভব নয়' : 'ফি দিয়ে ভর্তি নিশ্চিত করুন'}
              className={`px-5 py-2.5 text-xs font-bold rounded-xl transition flex items-center gap-2 ${
                isExpired || isCancelled
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-200 active:scale-[0.98]'
              }`}
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>প্রসেসিং...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span>ভর্তি ফি দিন</span>
                </>
              )}
            </button>
          )}

          {(isConfirmed || isExpired || isCancelled) && (
            <button
              onClick={onClose}
              className="px-5 py-2.5 text-xs font-bold text-white bg-slate-800 hover:bg-slate-900 rounded-xl transition"
            >
              বন্ধ করুন
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

