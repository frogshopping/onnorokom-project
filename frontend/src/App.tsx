import { useEffect, useState, useCallback } from 'react';
import { Header } from './components/Header';
import { ClassList } from './components/ClassList';
import { ActiveHoldModal } from './components/ActiveHoldModal';
import { CreateClassModal } from './components/CreateClassModal';
import { MyHolds } from './components/MyHolds';
import { AlertBanner } from './components/AlertBanner';
import { api } from './services/api';
import { ActiveHoldState, ClassItem, StudentHoldItem } from './types';

export function App() {
  const [studentId, setStudentId] = useState<string>(() => {
    return localStorage.getItem('student_id') || '';
  });

  const [activeHold, setActiveHold] = useState<ActiveHoldState | null>(() => {
    const saved = localStorage.getItem('active_hold');
    if (!saved) return null;
    try {
      return JSON.parse(saved);
    } catch {
      return null;
    }
  });

  const [activeView, setActiveView] = useState<'classes' | 'my-holds'>('classes');
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [myHolds, setMyHolds] = useState<StudentHoldItem[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [applyingClassId, setApplyingClassId] = useState<string | null>(null);
  const [classesLoading, setClassesLoading] = useState(true);
  const [holdsLoading, setHoldsLoading] = useState(false);

  const [alert, setAlert] = useState<{ type: 'error' | 'success' | 'warning' | 'info'; message: string } | null>(null);

  const handleStudentIdChange = (id: string) => {
    setStudentId(id);
    localStorage.setItem('student_id', id);
  };

  const updateActiveHold = (hold: ActiveHoldState | null) => {
    setActiveHold(hold);
    if (hold) {
      localStorage.setItem('active_hold', JSON.stringify(hold));
    } else {
      localStorage.removeItem('active_hold');
    }
  };

  const fetchClasses = useCallback(async (showLoading = false) => {
    try {
      if (showLoading) setClassesLoading(true);
      const data = await api.getClasses();
      setClasses(data);
    } catch (err: any) {
      console.error('Failed to fetch classes:', err);
      if (classes.length === 0) {
        setAlert({
          type: 'error',
          message: 'সার্ভারের সাথে সংযোগ পাওয়া যায়নি। ব্যাকএন্ড সার্ভিস সচল রয়েছে কিনা নিশ্চিত করুন।'
        });
      }
    } finally {
      if (showLoading) setClassesLoading(false);
    }
  }, [classes.length]);

  const fetchMyHolds = useCallback(async () => {
    if (!/^\d{17}$/.test(studentId)) {
      setMyHolds([]);
      return;
    }
    try {
      setHoldsLoading(true);
      const data = await api.getMyHolds(studentId);
      setMyHolds(data);
    } catch (err: any) {
      console.error('Failed to fetch my holds:', err);
    } finally {
      setHoldsLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    fetchClasses(true);
  }, [fetchClasses]);

  useEffect(() => {
    fetchMyHolds();
  }, [fetchMyHolds]);

  // Rule 10: Auto-refresh seat counts every 4 seconds without page reload
  useEffect(() => {
    const interval = setInterval(() => {
      fetchClasses(false);
      if (/^\d{17}$/.test(studentId)) {
        fetchMyHolds();
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [fetchClasses, fetchMyHolds, studentId]);

  const handleApply = async (cls: ClassItem) => {
    if (!/^\d{17}$/.test(studentId)) {
      setAlert({
        type: 'warning',
        message: 'আবেদন করার পূর্বে উপরে আপনার ১৭ অঙ্কের জন্ম নিবন্ধন নম্বর দিন।'
      });
      return;
    }

    setAlert(null);
    try {
      setApplyingClassId(cls.id);
      const response = await api.createHold(cls.id, studentId);

      const newHoldState: ActiveHoldState = {
        holdId: response.holdId,
        classId: response.classId,
        className: cls.name,
        expiresAt: response.expiresAt,
        status: response.status,
      };

      updateActiveHold(newHoldState);
      await fetchClasses(false);
      await fetchMyHolds();

      setAlert({
        type: 'info',
        message: `${cls.name}-এ আপনার সিট সাময়িক Hold করা হয়েছে। মেয়াদের মধ্যে ফি পরিশোধ করুন।`
      });
    } catch (err: any) {
      setAlert({
        type: 'error',
        message: err.message || 'আবেদন সম্পন্ন করা সম্ভব হয়নি।'
      });
    } finally {
      setApplyingClassId(null);
    }
  };

  const handleConfirmHold = async (holdId: string) => {
    try {
      await api.confirmHold(holdId, studentId);
      if (activeHold && activeHold.holdId === holdId) {
        updateActiveHold({
          ...activeHold,
          status: 'CONFIRMED'
        });
      }
      await fetchClasses(false);
      await fetchMyHolds();
      setAlert({
        type: 'success',
        message: 'ভর্তি সফলভাবে নিশ্চিত হয়েছে! শিক্ষার্থী আইডি ও আবেদন সংরক্ষিত।'
      });
    } catch (err: any) {
      throw err;
    }
  };

  const handleCancelHold = async (holdId: string) => {
    try {
      await api.cancelHold(holdId, studentId);
      if (activeHold && activeHold.holdId === holdId) {
        updateActiveHold({
          ...activeHold,
          status: 'CANCELLED'
        });
      }
      await fetchClasses(false);
      await fetchMyHolds();
      setAlert({
        type: 'info',
        message: 'আবেদনটি সফলভাবে প্রত্যাহার করা হয়েছে।'
      });
    } catch (err: any) {
      throw err;
    }
  };

  const handleCreateClass = async (name: string, totalSeats: number) => {
    await api.createClass({ name, totalSeats });
    await fetchClasses(false);
    setAlert({
      type: 'success',
      message: `"${name}" সফলভাবে যুক্ত হয়েছে।`
    });
  };

  const handleSelectHoldFromHistory = (hold: StudentHoldItem) => {
    updateActiveHold({
      holdId: hold.holdId,
      classId: hold.classId,
      className: hold.className,
      expiresAt: hold.expiresAt,
      status: hold.status,
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc]">
      {/* Top Header */}
      <Header
        studentId={studentId}
        onStudentIdChange={handleStudentIdChange}
        onOpenCreateClass={() => setIsCreateModalOpen(true)}
        activeView={activeView}
        onViewChange={setActiveView}
        holdsCount={myHolds.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {alert && (
          <AlertBanner
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert(null)}
          />
        )}

        {/* View Routing */}
        {activeView === 'classes' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <ClassList
                classes={classes}
                studentId={studentId}
                onApply={handleApply}
                applyingClassId={applyingClassId}
                loading={classesLoading}
              />
            </div>

            {/* Side Ledger: My Active Applications */}
            <div className="space-y-6">
              <MyHolds
                holds={myHolds}
                studentId={studentId}
                onSelectHold={handleSelectHoldFromHistory}
                loading={holdsLoading}
                onRefresh={fetchMyHolds}
              />

              {/* Information Card: Industrial Slate Gradient */}
              <div className="bg-gradient-to-b from-slate-900 to-slate-950 text-slate-300 rounded-2xl p-5 text-xs space-y-3 shadow-sm border border-slate-800">
                <div className="flex items-center gap-2 font-semibold text-white">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                  <span className="font-bangla tracking-tight">ভর্তি নির্দেশিকা ও নিয়মাবলী</span>
                </div>
                <ul className="space-y-2 text-slate-400 font-sans leading-relaxed">
                  <li className="flex items-start gap-2">
                    <span className="text-slate-600 font-mono">01.</span>
                    <span>সিট খালি থাকা সাপেক্ষে আবেদনের সাথে সাথে সিটটি ১০ মিনিটের জন্য সাময়িক সংরক্ষিত (Hold) হবে।</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-slate-600 font-mono">02.</span>
                    <span>কাউন্টডাউন শূন্য হওয়ার পূর্বেই "ভর্তি ফি দিন" বাটনে চাপ দিয়ে ভর্তি চূড়ান্ত করতে হবে।</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-slate-600 font-mono">03.</span>
                    <span>নির্ধারিত সময়ে ফি না দিলে সিটটি নিজে থেকেই মুক্ত হয়ে অন্য শিক্ষার্থীর জন্য উপলব্ধ হবে।</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto">
            <MyHolds
              holds={myHolds}
              studentId={studentId}
              onSelectHold={handleSelectHoldFromHistory}
              loading={holdsLoading}
              onRefresh={fetchMyHolds}
            />
          </div>
        )}

      </main>

      {/* Modern Institutional Footer */}
      <footer className="mt-auto border-t border-slate-200/80 bg-white py-5 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">অন্বেষণ বিদ্যাপীঠ</span>
            <span>•</span>
            <span>School Admission & Concurrency Management Engine</span>
          </div>
          <div className="flex items-center gap-4 font-mono text-[11px] text-slate-400">
            <span>PostgreSQL 16 Multi-Process Protected</span>
            <span>•</span>
            <span>ASP.NET Core 8</span>
          </div>
        </div>
      </footer>

      {/* Reservation Slip Modal */}
      <ActiveHoldModal
        activeHold={activeHold}
        studentId={studentId}
        onConfirm={handleConfirmHold}
        onCancel={handleCancelHold}
        onClose={() => updateActiveHold(null)}
      />

      {/* Admin Create Class Modal */}
      <CreateClassModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateClass}
      />
    </div>
  );
}
