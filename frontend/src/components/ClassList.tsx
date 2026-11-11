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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-800">ভর্তিযোগ্য ক্লাসের তালিকা</h2>
          <p className="text-xs text-slate-500">সিটের তথ্য প্রতি কয়েক সেকেন্ড পর পর স্বয়ংক্রিয়ভাবে আপডেট হচ্ছে</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>লাইভ সিট মনিটরিং</span>
        </div>
      </div>

      {loading && classes.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mb-3"></div>
          <p className="text-sm text-slate-600 font-medium">ক্লাসের তথ্য লোড হচ্ছে...</p>
        </div>
      ) : classes.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm">
          <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-base font-bold text-slate-800">কোনো ক্লাস পাওয়া যায়নি</h3>
          <p className="text-xs text-slate-500 mt-1">অ্যাডমিন হিসেবে উপরে "নতুন ক্লাস তৈরি" বাটনে ক্লিক করে ক্লাস যোগ করুন।</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {classes.map((cls) => {
            const isFull = cls.availableSeats <= 0;
            const isApplying = applyingClassId === cls.id;

            return (
              <div
                key={cls.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <h3 className="text-base font-bold text-slate-900 leading-snug">{cls.name}</h3>
                    <span
                      className={`px-2.5 py-1 text-[11px] font-bold rounded-full ${
                        isFull
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {isFull ? 'আসন পূর্ণ' : `${cls.availableSeats} সিট খালি`}
                    </span>
                  </div>

                  {/* Seat Statistics Grid */}
                  <div className="grid grid-cols-2 gap-2 my-4">
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <p className="text-[11px] text-slate-500 font-medium">মোট আসন</p>
                      <p className="text-base font-bold text-slate-800">{cls.totalSeats}</p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-blue-50/60 border border-blue-100">
                      <p className="text-[11px] text-blue-600 font-medium">খালি সিট</p>
                      <p className="text-base font-bold text-blue-700">{cls.availableSeats}</p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-100">
                      <p className="text-[11px] text-amber-600 font-medium">Hold-এ আছে</p>
                      <p className="text-base font-bold text-amber-700">{cls.heldSeats}</p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-100">
                      <p className="text-[11px] text-emerald-600 font-medium">নিশ্চিত ভর্তি</p>
                      <p className="text-base font-bold text-emerald-700">{cls.confirmedSeats}</p>
                    </div>
                  </div>
                </div>

                {/* Apply Action */}
                <div className="pt-3 border-t border-slate-100">
                  <button
                    onClick={() => onApply(cls)}
                    disabled={isFull || isApplying || !isStudentIdValid}
                    title={
                      !isStudentIdValid
                        ? 'আগে উপরে ১৭ অঙ্কের জন্ম নিবন্ধন নম্বর দিন'
                        : isFull
                        ? 'সিট খালি নেই'
                        : 'আবেদন করুন'
                    }
                    className={`w-full py-2.5 px-4 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 ${
                      isFull
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        : !isStudentIdValid
                        ? 'bg-slate-100 text-slate-500 cursor-not-allowed hover:bg-slate-200'
                        : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-200 active:scale-[0.98]'
                    }`}
                  >
                    {isApplying ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>প্রসেসিং...</span>
                      </>
                    ) : isFull ? (
                      <span>আসন পূর্ণ</span>
                    ) : !isStudentIdValid ? (
                      <span>জন্ম নিবন্ধন নম্বর দিন</span>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>আবেদন করুন</span>
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

