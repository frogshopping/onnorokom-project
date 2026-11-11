import React from 'react';

interface HeaderProps {
  studentId: string;
  onStudentIdChange: (id: string) => void;
  onOpenCreateClass: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  studentId,
  onStudentIdChange,
  onOpenCreateClass,
}) => {
  const isValid = /^\d{17}$/.test(studentId);

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Logo & System Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-200">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800 tracking-tight">অন্বেষণ উচ্চ বিদ্যালয়</h1>
              <p className="text-xs text-slate-500 font-medium">অনলাইন ভর্তি ও আসন বুকিং প্ল্যাটফর্ম</p>
            </div>
          </div>

          {/* Student ID & Admin Button */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 sm:w-80">
              <label htmlFor="student-id" className="sr-only">শিক্ষার্থীর জন্ম নিবন্ধন নম্বর</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input
                  id="student-id"
                  type="text"
                  maxLength={17}
                  placeholder="শিক্ষার্থীর ১৭ অঙ্কের জন্ম নিবন্ধন নম্বর"
                  value={studentId}
                  onChange={(e) => onStudentIdChange(e.target.value.replace(/\D/g, ''))}
                  className={`w-full pl-9 pr-8 py-2 text-sm rounded-lg border font-mono transition-colors focus:outline-none focus:ring-2 ${
                    studentId.length === 0
                      ? 'border-slate-300 focus:border-blue-500 focus:ring-blue-100'
                      : isValid
                      ? 'border-emerald-500 bg-emerald-50/30 text-emerald-900 focus:ring-emerald-100'
                      : 'border-amber-400 bg-amber-50/20 text-slate-800 focus:ring-amber-100'
                  }`}
                />
                <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none text-xs">
                  {studentId.length > 0 && (
                    <span className={`font-semibold ${isValid ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {studentId.length}/17
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* School Admin Action */}
            <button
              onClick={onOpenCreateClass}
              className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition flex items-center gap-1.5 border border-slate-200"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              <span>নতুন ক্লাস তৈরি (Admin)</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};

