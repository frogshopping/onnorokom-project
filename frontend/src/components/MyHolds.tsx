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
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-base font-bold text-slate-800">আমার আবেদনসমূহ</h3>
          <p className="text-xs text-slate-500">আইডি: <span className="font-mono font-semibold">{studentId || 'প্রদান করা হয়নি'}</span></p>
        </div>
        <button
          onClick={onRefresh}
          disabled={!isStudentIdValid || loading}
          className="text-xs font-semibold text-blue-600 hover:text-blue-800 p-1.5 rounded-lg hover:bg-blue-50 transition flex items-center gap-1 disabled:opacity-40"
          title="রিফ্রেশ করুন"
        >
          <svg className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>আপডেট</span>
        </button>
      </div>

      {!isStudentIdValid ? (
        <div className="py-8 text-center text-xs text-slate-500">
          উপরে ১৭ অঙ্কের জন্ম নিবন্ধন নম্বর দিলে আপনার আবেদনের ইতিহাস দেখতে পাবেন।
        </div>
      ) : loading && holds.length === 0 ? (
        <div className="py-8 text-center">
          <div className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent mb-2"></div>
          <p className="text-xs text-slate-500">আবেদনসমূহ যাচাই করা হচ্ছে...</p>
        </div>
      ) : holds.length === 0 ? (
        <div className="py-8 text-center text-xs text-slate-500">
          এই শিক্ষার্থীর নামে এখনও কোনো আবেদন করা হয়নি।
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {holds.map((h) => {
            const isHeld = h.status === 'HELD';
            const isConfirmed = h.status === 'CONFIRMED';
            const isExpired = h.status === 'EXPIRED';

            const badgeColor = isConfirmed
              ? 'bg-emerald-100 text-emerald-800'
              : isHeld
              ? 'bg-amber-100 text-amber-900 animate-pulse'
              : isExpired
              ? 'bg-rose-100 text-rose-800'
              : 'bg-slate-100 text-slate-700';

            return (
              <div
                key={h.holdId}
                className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50 px-2 rounded-xl transition cursor-pointer"
                onClick={() => onSelectHold(h)}
              >
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{h.className}</h4>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500 font-mono">
                    <span>ID: {h.holdId}</span>
                    <span>•</span>
                    <span>মেয়াদ: {new Date(h.expiresAt).toLocaleTimeString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${badgeColor}`}>
                    {h.status}
                  </span>
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

