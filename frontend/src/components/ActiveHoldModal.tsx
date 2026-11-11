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
        setCurrentStatus('EXPIRED');
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
      setError(err.message || 'ভর্তি নিশ্চিতকরণ সম্পন্ন করা যায়নি।');
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
      setError(err.message || 'আবেদন বাতিল করতে সমস্যা হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-xs animate-sheet">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-xl border border-slate-200 overflow-hidden relative">
        
        {/* Top Header */}
        <div className="px-6 pt-5 pb-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 font-semibold">
                আসন সংরক্ষণ রশিদ
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900 mt-0.5 font-bangla">{activeHold.className}</h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 bg-slate-50 border border-slate-300 text-slate-800 text-xs rounded-xl flex items-start gap-2">
            <svg className="w-4 h-4 text-slate-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* Clean Light Ticket Body */}
        <div className="p-6 space-y-4">
          
          {/* Status Hero: Pure Clean White / Slate-50 */}
          {currentStatus === 'HELD' && (
            <div className="p-6 rounded-2xl bg-slate-50 text-slate-900 text-center border border-slate-200 relative overflow-hidden">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white text-slate-700 text-[10px] font-mono mb-2 border border-slate-200 shadow-2xs font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>আসন সাময়িক সংরক্ষিত (HELD)</span>
              </div>

              <p className="text-xs text-slate-500 font-sans mb-1 font-medium">ফি পরিশোধের অবশিষ্ট সময়সীমা</p>
              
              <div className="text-4xl sm:text-5xl font-mono font-bold tracking-wider text-slate-900 my-1.5 tabular-nums">
                {formattedTime}
              </div>

              <p className="text-[11px] text-slate-500 font-sans max-w-xs mx-auto mt-2 leading-relaxed">
                উক্ত সময়ের মধ্যে ফি জমা না দিলে আসনটি নিজে থেকেই মুক্ত হয়ে যাবে।
              </p>
            </div>
          )}

          {isConfirmed && (
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center">
              <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto mb-2.5 shadow-2xs">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h4 className="text-sm font-bold text-slate-900 font-bangla">ভর্তি সফলভাবে নিশ্চিত হয়েছে!</h4>
              <p className="text-xs text-slate-500 mt-1">
                শিক্ষার্থীর আসনটি স্থায়ীভাবে কনফার্ম করা হয়েছে।
              </p>
            </div>
          )}

          {isExpired && (
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center">
              <h4 className="text-sm font-bold text-slate-900 font-bangla">আবেদনের মেয়াদ শেষ হয়ে গেছে</h4>
              <p className="text-xs text-slate-500 mt-1">
                নির্ধারিত সময়ে ফি জমা না দেওয়ায় আসনটি মুক্ত করা হয়েছে।
              </p>
            </div>
          )}

          {isCancelled && (
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center">
              <h4 className="text-sm font-bold text-slate-900 font-bangla">আবেদনটি বাতিল করা হয়েছে</h4>
              <p className="text-xs text-slate-500 mt-1">সিটটি পুনরায় সাধারণ আবেদনের জন্য উন্মুক্ত।</p>
            </div>
          )}

          {/* Key-Value Details */}
          <div className="space-y-2 text-xs font-mono bg-white p-3.5 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500 font-sans">হোল্ড রেফারেন্স ID</span>
              <span className="font-semibold text-slate-800">{activeHold.holdId}</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500 font-sans">শিক্ষার্থীর জন্ম নিবন্ধন</span>
              <span className="font-semibold text-slate-800">{studentId}</span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-slate-500 font-sans">বর্তমান স্ট্যাটাস</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-slate-100 text-slate-800 border border-slate-200">
                {currentStatus}
              </span>
            </div>
          </div>

        </div>

        {/* Action Tray */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
          {!isConfirmed && !isExpired && !isCancelled && (
            <button
              onClick={handleCancel}
              disabled={loading}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
            >
              আবেদন প্রত্যাহার
            </button>
          )}

          {!isConfirmed && (
            <button
              onClick={handleConfirm}
              disabled={isExpired || isCancelled || loading}
              className={`px-5 py-2.5 text-xs font-semibold rounded-xl transition flex items-center gap-2 ${
                isExpired || isCancelled
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-slate-900 hover:bg-slate-800 text-white shadow-xs active:scale-[0.99]'
              }`}
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>প্রসেসিং হচ্ছে...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span>ভর্তি ফি প্রদান করুন (Confirm)</span>
                </>
              )}
            </button>
          )}

          {(isConfirmed || isExpired || isCancelled) && (
            <button
              onClick={onClose}
              className="px-5 py-2 text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 rounded-xl transition"
            >
              বন্ধ করুন
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
