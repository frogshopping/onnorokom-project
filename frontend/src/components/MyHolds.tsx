import React from 'react';
import { StudentHoldItem } from '../types';

interface MyHoldsProps {
  holds: StudentHoldItem[];
  studentId: string;
  onSelectHold: (hold: StudentHoldItem) => void;
  loading: boolean;
  onRefresh: () => void;
}

export const MyHolds: React.FC<MyHoldsProps> = ({
  holds,
  studentId,
  onSelectHold,
  loading,
  onRefresh,
}) => {
  const isStudentIdValid = /^\d{17}$/.test(studentId);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
      
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">আমার আবেদন তালিকা</h3>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            শিক্ষার্থী ID: <span className="font-semibold text-slate-800">{studentId || 'প্রদান করা হয়নি'}</span>
          </p>
        </div>
        <button
          onClick={onRefresh}
          disabled={!isStudentIdValid || loading}
          className="text-xs font-medium text-slate-600 hover:text-slate-900 p-2 rounded-lg hover:bg-slate-100 transition flex items-center gap-1.5 disabled:opacity-40"
          title="রিফ্রেশ করুন"
        >
          <svg className={`w-3.5 h-3.5 text-slate-500 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span className="hidden sm:inline">রিফ্রেশ</span>
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        {!isStudentIdValid ? (
          <div className="py-10 text-center text-xs text-slate-500">
            <div className="w-9 h-9 mx-auto rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 mb-2 border border-slate-200">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <p className="font-semibold text-slate-800">জন্ম নিবন্ধন নম্বর প্রদান করুন</p>
            <p className="text-[11px] text-slate-400 mt-0.5 max-w-xs mx-auto">
              উপরে হেডার বক্সে ১৭ অঙ্কের জন্ম নিবন্ধন নম্বর দিলে আপনার আবেদনের ইতিহাস দেখতে পাবেন।
            </p>
          </div>
        ) : loading && holds.length === 0 ? (
          <div className="py-10 text-center">
            <div className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-slate-900 border-t-transparent mb-2"></div>
            <p className="text-xs text-slate-500">আবেদনের হিস্ট্রি রিড করা হচ্ছে...</p>
          </div>
        ) : holds.length === 0 ? (
          <div className="py-10 text-center text-xs text-slate-500">
            <div className="w-9 h-9 mx-auto rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 mb-2 border border-slate-200">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="font-semibold text-slate-800">কোনো পূর্ববর্তী আবেদন নেই</p>
            <p className="text-[11px] text-slate-400 mt-0.5">বামপাশের ক্লাস তালিকা থেকে আপনার পছন্দের ক্লাসে আবেদন করুন।</p>
          </div>
        ) : (
          <div className="space-y-2">
            {holds.map((h) => {
              const isHeld = h.status === 'HELD';
              const isConfirmed = h.status === 'CONFIRMED';
              const isExpired = h.status === 'EXPIRED';

              const badgeClasses = isConfirmed
                ? 'bg-slate-900 text-white border-slate-900'
                : isHeld
                ? 'bg-slate-100 text-slate-800 border-slate-300'
                : isExpired
                ? 'bg-slate-100 text-slate-400 border-slate-200 line-through'
                : 'bg-slate-100 text-slate-600 border-slate-200';

              return (
                <div
                  key={h.holdId}
                  onClick={() => onSelectHold(h)}
                  className="p-3 rounded-xl border border-slate-200/80 hover:border-slate-300 bg-white hover:bg-slate-50/80 transition cursor-pointer flex items-center justify-between gap-3 group"
                >
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 font-bangla">
                      {h.className}
                    </h4>
                    <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400 font-mono">
                      <span>ID: {h.holdId}</span>
                      <span>•</span>
                      <span>{new Date(h.expiresAt).toLocaleTimeString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${badgeClasses}`}>
                      {h.status}
                    </span>
                    <svg className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
