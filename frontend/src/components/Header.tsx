import React from 'react';

interface HeaderProps {
  studentId: string;
  onStudentIdChange: (id: string) => void;
  onOpenCreateClass: () => void;
  activeView: 'classes' | 'my-holds';
  onViewChange: (view: 'classes' | 'my-holds') => void;
  holdsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  studentId,
  onStudentIdChange,
  onOpenCreateClass,
  activeView,
  onViewChange,
  holdsCount,
}) => {
  const isValid = /^\d{17}$/.test(studentId);

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 transition-all">
      {/* Top micro-bar for institutional trust */}
      <div className="bg-slate-900 text-slate-300 text-[11px] font-mono tracking-wider px-4 sm:px-8 py-1.5 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-emerald-400 font-sans font-medium">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>সিস্টেম লাইভ • First-Come, First-Served</span>
          </span>
          <span className="text-slate-600 hidden md:inline">|</span>
          <span className="text-slate-400 hidden md:inline font-sans text-xs">
            সেশন ২০২৬–২০২৭ অনলাইন কেন্দ্রীয় ভর্তি
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs font-sans">
          <button
            onClick={onOpenCreateClass}
            className="text-slate-300 hover:text-white transition flex items-center gap-1.5 font-medium px-2 py-0.5 rounded hover:bg-slate-800"
          >
            <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>ক্লাস সংযোজন (Admin)</span>
          </button>
        </div>
      </div>

      {/* Main navigation & Identity bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          
          {/* Brand Identity */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center text-white shadow-sm ring-1 ring-slate-900/10">
                <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.333A2.25 2.25 0 0018.25 8.25h-12.5A2.25 2.25 0 003.5 10.333V21" />
                </svg>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base font-bold text-slate-900 tracking-tight font-bangla">অন্বেষণ বিদ্যাপীঠ</h1>
                  <span className="px-1.5 py-0.5 text-[10px] font-mono font-medium rounded bg-slate-100 text-slate-600 border border-slate-200">
                    ADMISSION-CORE v2.0
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-sans">স্বয়ংক্রিয় আসন বরাদ্দ ও তাৎক্ষণিক যাচাইকরণ</p>
              </div>
            </div>

            {/* Mobile Tab Pill */}
            <div className="flex lg:hidden rounded-lg bg-slate-100 p-1 border border-slate-200 text-xs font-medium">
              <button
                onClick={() => onViewChange('classes')}
                className={`px-3 py-1.5 rounded-md transition ${activeView === 'classes' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-600'}`}
              >
                ক্লাসসমূহ
              </button>
              <button
                onClick={() => onViewChange('my-holds')}
                className={`px-3 py-1.5 rounded-md transition flex items-center gap-1.5 ${activeView === 'my-holds' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-600'}`}
              >
                <span>আবেদন</span>
                {holdsCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-slate-900 text-white text-[10px] flex items-center justify-center font-mono">
                    {holdsCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Student National ID Credential Input */}
          <div className="flex items-center gap-3">
            <div className="hidden lg:flex rounded-xl bg-slate-100/80 p-1 border border-slate-200/80 text-xs font-semibold">
              <button
                onClick={() => onViewChange('classes')}
                className={`px-4 py-2 rounded-lg transition ${activeView === 'classes' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
              >
                আসন তালিকা
              </button>
              <button
                onClick={() => onViewChange('my-holds')}
                className={`px-4 py-2 rounded-lg transition flex items-center gap-2 ${activeView === 'my-holds' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
              >
                <span>আমার আবেদনসমূহ</span>
                {holdsCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-slate-900 text-white text-[10px] font-mono">
                    {holdsCount}
                  </span>
                )}
              </button>
            </div>

            {/* Digital Identity Box */}
            <div className="w-full sm:w-80 relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-slate-800 transition">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                </svg>
              </div>
              <input
                type="text"
                maxLength={17}
                placeholder="১৭ অঙ্কের জন্ম নিবন্ধন নম্বর দিন"
                value={studentId}
                onChange={(e) => onStudentIdChange(e.target.value.replace(/\D/g, ''))}
                className={`w-full pl-10 pr-14 py-2.5 text-xs font-mono font-medium rounded-xl border transition-all focus:outline-none focus:ring-4 ${
                  studentId.length === 0
                    ? 'border-slate-300 bg-white shadow-xs focus:border-slate-800 focus:ring-slate-100'
                    : isValid
                    ? 'border-emerald-600/70 bg-emerald-50/20 text-slate-900 focus:border-emerald-700 focus:ring-emerald-50'
                    : 'border-amber-400 bg-amber-50/20 text-slate-900 focus:border-amber-500 focus:ring-amber-50'
                }`}
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-[11px] font-mono">
                {studentId.length > 0 && (
                  <span className={`px-1.5 py-0.5 rounded font-semibold ${isValid ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                    {studentId.length}/17
                  </span>
                )}
              </div>
            </div>

          </div>

        </div>
      </div>
    </header>
  );
};
