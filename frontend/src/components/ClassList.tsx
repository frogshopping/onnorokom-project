import React from 'react';
import { ClassItem } from '../types';

interface ClassListProps {
  classes: ClassItem[];
  studentId: string;
  onApply: (cls: ClassItem) => void;
  applyingClassId: string | null;
  loading: boolean;
}

export const ClassList: React.FC<ClassListProps> = ({
  classes,
  studentId,
  onApply,
  applyingClassId,
  loading,
}) => {
  const isStudentIdValid = /^\d{17}$/.test(studentId);

  // Overall statistics calculation
  const totalCapacity = classes.reduce((acc, c) => acc + c.totalSeats, 0);
  const totalConfirmed = classes.reduce((acc, c) => acc + c.confirmedSeats, 0);
  const totalHeld = classes.reduce((acc, c) => acc + c.heldSeats, 0);
  const totalAvailable = classes.reduce((acc, c) => acc + c.availableSeats, 0);

  return (
    <div className="space-y-6">
      
      {/* High-End Real-Time Analytics Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">মোট আসন সক্ষমতা</span>
            <span className="w-2 h-2 rounded-full bg-slate-400"></span>
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
            {totalCapacity}
          </div>
          <span className="text-[11px] text-slate-400 mt-1">সব শাখা ও শিফট মিলিয়ে</span>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-blue-600 mb-1">
            <span className="text-xs font-medium">খালি আসন (Available)</span>
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
          </div>
          <div className="text-2xl font-bold font-mono text-blue-700 tabular-nums">
            {totalAvailable}
          </div>
          <span className="text-[11px] text-blue-600/80 mt-1">আবেদনের জন্য উন্মুক্ত</span>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-amber-600 mb-1">
            <span className="text-xs font-medium">চলমান হোল্ড (In-Hold)</span>
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
          </div>
          <div className="text-2xl font-bold font-mono text-amber-700 tabular-nums">
            {totalHeld}
          </div>
          <span className="text-[11px] text-amber-600/80 mt-1">পেমেন্ট প্রক্রিয়ার অপেক্ষায়</span>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-emerald-600 mb-1">
            <span className="text-xs font-medium">নিশ্চিত ভর্তি (Confirmed)</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-700 tabular-nums">
            {totalConfirmed}
          </div>
          <span className="text-[11px] text-emerald-600/80 mt-1">ফি পরিশোধ সম্পন্ন</span>
        </div>
      </div>

      {/* Main Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-2">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>ভর্তিযোগ্য শ্রেণিসমূহ</span>
            <span className="text-xs font-normal text-slate-500">({classes.length}টি ক্লাস তালিকাভুক্ত)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">প্রতি ৪ সেকেন্ড পরপর সিট পরিসংখ্যান ডাটাবেস থেকে স্বয়ংক্রিয়ভাবে রিফ্রেশ হচ্ছে</p>
        </div>

        {!isStudentIdValid && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium">
            <svg className="w-4 h-4 text-amber-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>আবেদন করতে উপরে ১৭ অঙ্কের জন্ম নিবন্ধন নম্বর লিখুন</span>
          </div>
        )}
      </div>

      {/* Class Cards Grid */}
      {loading && classes.length === 0 ? (
        <div className="bg-white rounded-2xl p-16 text-center border border-slate-200 shadow-xs">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-slate-900 border-t-transparent mb-3.5"></div>
          <p className="text-sm font-semibold text-slate-700">লাইভ সিট ম্যাট্রিক্স লোড হচ্ছে...</p>
        </div>
      ) : classes.length === 0 ? (
        <div className="bg-white rounded-2xl p-14 text-center border border-slate-200 shadow-xs">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500 mb-3 border border-slate-200">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-sm font-bold text-slate-800">কোনো ক্লাসের তথ্য পাওয়া যায়নি</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            স্কুল অ্যাডমিন প্যানেল থেকে উপরে ডানপাশে "ক্লাস সংযোজন (Admin)" বাটনে ক্লিক করে নতুন ক্লাস তৈরি করুন।
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {classes.map((cls) => {
            const isFull = cls.availableSeats <= 0;
            const isApplying = applyingClassId === cls.id;

            // Capacity bar ratios
            const confirmedRatio = cls.totalSeats > 0 ? (cls.confirmedSeats / cls.totalSeats) * 100 : 0;
            const heldRatio = cls.totalSeats > 0 ? (cls.heldSeats / cls.totalSeats) * 100 : 0;
            const availableRatio = cls.totalSeats > 0 ? (cls.availableSeats / cls.totalSeats) * 100 : 0;

            return (
              <div
                key={cls.id}
                className="group bg-white rounded-2xl p-5 border border-slate-200/90 hover:border-slate-300 shadow-xs hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-400 block mb-0.5">
                        ID: {cls.id}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 group-hover:text-slate-800 transition">
                        {cls.name}
                      </h3>
                    </div>

                    <div className="flex flex-col items-end">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                          isFull
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        }`}
                      >
                        {isFull ? 'আসন পূর্ণ' : `${cls.availableSeats} সিট খালি`}
                      </span>
                    </div>
                  </div>

                  {/* Multi-Segment Capacity Visualization Bar */}
                  <div className="my-4">
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex">
                      <div
                        style={{ width: `${confirmedRatio}%` }}
                        className="bg-slate-800 transition-all duration-500"
                        title={`নিশ্চিত ভর্তি: ${cls.confirmedSeats}`}
                      />
                      <div
                        style={{ width: `${heldRatio}%` }}
                        className="bg-amber-400 transition-all duration-500"
                        title={`হোল্ডে আছে: ${cls.heldSeats}`}
                      />
                      <div
                        style={{ width: `${availableRatio}%` }}
                        className="bg-emerald-500 transition-all duration-500"
                        title={`খালি সিট: ${cls.availableSeats}`}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1.5 font-mono">
                      <span>০</span>
                      <span>মোট {cls.totalSeats} আসন</span>
                    </div>
                  </div>

                  {/* Tabular Details Grid */}
                  <div className="grid grid-cols-4 gap-2 text-center my-4 py-2.5 px-3 rounded-xl bg-slate-50/70 border border-slate-100 font-mono">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-sans">মোট</span>
                      <span className="text-sm font-bold text-slate-800 tabular-nums">{cls.totalSeats}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-emerald-600 block font-sans">খালি</span>
                      <span className="text-sm font-bold text-emerald-700 tabular-nums">{cls.availableSeats}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-amber-600 block font-sans">হোল্ড</span>
                      <span className="text-sm font-bold text-amber-700 tabular-nums">{cls.heldSeats}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block font-sans">নিশ্চিত</span>
                      <span className="text-sm font-bold text-slate-800 tabular-nums">{cls.confirmedSeats}</span>
                    </div>
                  </div>
                </div>

                {/* Primary Action Button */}
                <div className="pt-2">
                  <button
                    onClick={() => onApply(cls)}
                    disabled={isFull || isApplying || !isStudentIdValid}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold tracking-wide transition-all flex items-center justify-center gap-2 ${
                      isFull
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                        : !isStudentIdValid
                        ? 'bg-slate-100 text-slate-500 hover:bg-slate-200 border border-slate-200 cursor-not-allowed'
                        : 'bg-slate-900 text-white hover:bg-slate-800 shadow-sm active:scale-[0.99]'
                    }`}
                  >
                    {isApplying ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>আসন যাচাই করা হচ্ছে...</span>
                      </>
                    ) : isFull ? (
                      <span>কোনো আসন খালি নেই</span>
                    ) : !isStudentIdValid ? (
                      <span>আগে জন্ম নিবন্ধন নম্বর প্রদান করুন</span>
                    ) : (
                      <>
                        <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                        </svg>
                        <span>আবেদন করুন (Hold Seat)</span>
                      </>
                    )}
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
