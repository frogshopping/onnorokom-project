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

  // Overall metrics calculation
  const totalCapacity = classes.reduce((acc, c) => acc + c.totalSeats, 0);
  const totalConfirmed = classes.reduce((acc, c) => acc + c.confirmedSeats, 0);
  const totalHeld = classes.reduce((acc, c) => acc + c.heldSeats, 0);
  const totalAvailable = classes.reduce((acc, c) => acc + c.availableSeats, 0);

  return (
    <div className="space-y-6">
      
      {/* Industrial Grade Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">মোট আসন সক্ষমতা</span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
            {totalCapacity}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">সব শিফট মিলিয়ে মোট আসন</span>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between text-slate-600 mb-1">
            <span className="text-xs font-medium">উপলব্ধ আসন (Available)</span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-900"></span>
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
            {totalAvailable}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">তাৎক্ষণিক আবেদনের যোগ্য</span>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">চলমান হোল্ড (In-Hold)</span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
          </div>
          <div className="text-2xl font-bold font-mono text-slate-800 tabular-nums">
            {totalHeld}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">পেমেন্টের অপেক্ষায় সংরক্ষিত</span>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">নিশ্চিত ভর্তি (Confirmed)</span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
            {totalConfirmed}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">ফি জমা সম্পন্ন হয়েছে</span>
        </div>
      </div>

      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-1">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>ভর্তিযোগ্য ক্লাস ও শিফটসমূহ</span>
            <span className="text-xs font-mono font-medium text-slate-400">({classes.length})</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">প্রতি ৪ সেকেন্ড পর পর ডাটাবেস থেকে স্বয়ংক্রিয় সিট আপডেট হচ্ছে</p>
        </div>

        {!isStudentIdValid && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 text-xs font-medium">
            <svg className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>আবেদন করতে উপরে জন্ম নিবন্ধন নম্বর দিন</span>
          </div>
        )}
      </div>

      {/* Class Cards Grid */}
      {loading && classes.length === 0 ? (
        <div className="bg-white rounded-2xl p-16 text-center border border-slate-200/90 shadow-xs">
          <div className="inline-block animate-spin rounded-full h-7 w-7 border-2 border-slate-900 border-t-transparent mb-3"></div>
          <p className="text-xs font-semibold text-slate-600">লাইভ সিট ম্যাট্রিক্স লোড হচ্ছে...</p>
        </div>
      ) : classes.length === 0 ? (
        <div className="bg-white rounded-2xl p-14 text-center border border-slate-200/90 shadow-xs">
          <div className="w-10 h-10 mx-auto rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 mb-2.5 border border-slate-200">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-sm font-bold text-slate-800">কোনো ক্লাসের তথ্য পাওয়া যায়নি</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            উপরে "ক্লাস সংযোজন (Admin)" বাটনে ক্লিক করে নতুন ক্লাস তৈরি করুন।
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {classes.map((cls) => {
            const isFull = cls.availableSeats <= 0;
            const isApplying = applyingClassId === cls.id;

            // Ratios for monochromatic bar
            const confirmedRatio = cls.totalSeats > 0 ? (cls.confirmedSeats / cls.totalSeats) * 100 : 0;
            const heldRatio = cls.totalSeats > 0 ? (cls.heldSeats / cls.totalSeats) * 100 : 0;
            const availableRatio = cls.totalSeats > 0 ? (cls.availableSeats / cls.totalSeats) * 100 : 0;

            return (
              <div
                key={cls.id}
                className="group bg-white rounded-2xl p-5 border border-slate-200/90 hover:border-slate-300 shadow-xs hover:shadow-sm transition flex flex-col justify-between"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <span className="text-[10px] font-mono font-medium text-slate-400 block mb-0.5">
                        ID: {cls.id}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 font-bangla">
                        {cls.name}
                      </h3>
                    </div>

                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-mono font-semibold border ${
                        isFull
                          ? 'bg-slate-100 text-slate-500 border-slate-200'
                          : 'bg-slate-900 text-white border-slate-900'
                      }`}
                    >
                      {isFull ? 'পূর্ণ' : `${cls.availableSeats} সিট খালি`}
                    </span>
                  </div>

                  {/* Sophisticated Monochromatic Progress Bar */}
                  <div className="my-4">
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex">
                      <div
                        style={{ width: `${confirmedRatio}%` }}
                        className="bg-slate-900 transition-all duration-500"
                        title={`নিশ্চিত: ${cls.confirmedSeats}`}
                      />
                      <div
                        style={{ width: `${heldRatio}%` }}
                        className="bg-slate-400 transition-all duration-500"
                        title={`হোল্ড: ${cls.heldSeats}`}
                      />
                      <div
                        style={{ width: `${availableRatio}%` }}
                        className="bg-slate-200 transition-all duration-500"
                        title={`খালি: ${cls.availableSeats}`}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1.5 font-mono">
                      <span>বুকড: {cls.confirmedSeats + cls.heldSeats}</span>
                      <span>মোট: {cls.totalSeats}</span>
                    </div>
                  </div>

                  {/* Tabular Details Grid */}
                  <div className="grid grid-cols-4 gap-2 text-center my-4 py-2.5 px-3 rounded-xl bg-slate-50 border border-slate-100 font-mono">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-sans">মোট</span>
                      <span className="text-sm font-semibold text-slate-800 tabular-nums">{cls.totalSeats}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-700 block font-sans font-medium">খালি</span>
                      <span className="text-sm font-bold text-slate-900 tabular-nums">{cls.availableSeats}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block font-sans">হোল্ড</span>
                      <span className="text-sm font-semibold text-slate-700 tabular-nums">{cls.heldSeats}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block font-sans">নিশ্চিত</span>
                      <span className="text-sm font-semibold text-slate-700 tabular-nums">{cls.confirmedSeats}</span>
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
                        : 'bg-gradient-to-r from-slate-900 to-slate-850 hover:from-slate-800 hover:to-slate-800 text-white shadow-xs active:scale-[0.99] border border-slate-800'
                    }`}
                  >
                    {isApplying ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>আসন যাচাই হচ্ছে...</span>
                      </>
                    ) : isFull ? (
                      <span>কোনো আসন খালি নেই</span>
                    ) : !isStudentIdValid ? (
                      <span>জন্ম নিবন্ধন নম্বর প্রদান করুন</span>
                    ) : (
                      <>
                        <svg className="w-3.5 h-3.5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
