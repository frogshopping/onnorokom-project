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
  // Student ID with localStorage persistence
  const [studentId, setStudentId] = useState<string>(() => {
    return localStorage.getItem('student_id') || '';
  });

  // Active Hold with localStorage persistence (Rule 11)
  const [activeHold, setActiveHold] = useState<ActiveHoldState | null>(() => {
    const saved = localStorage.getItem('active_hold');
    if (!saved) return null;
    try {
      return JSON.parse(saved);
    } catch {
      return null;
    }
  });

  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [myHolds, setMyHolds] = useState<StudentHoldItem[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [applyingClassId, setApplyingClassId] = useState<string | null>(null);
  const [classesLoading, setClassesLoading] = useState(true);
  const [holdsLoading, setHoldsLoading] = useState(false);

  // Global Alert State (Rule 12)
  const [alert, setAlert] = useState<{ type: 'error' | 'success' | 'warning' | 'info'; message: string } | null>(null);

  // Save studentId to localStorage
  const handleStudentIdChange = (id: string) => {
    setStudentId(id);
    localStorage.setItem('student_id', id);
  };

  // Save activeHold to localStorage
  const updateActiveHold = (hold: ActiveHoldState | null) => {
    setActiveHold(hold);
    if (hold) {
      localStorage.setItem('active_hold', JSON.stringify(hold));
    } else {
      localStorage.removeItem('active_hold');
    }
  };

  // Fetch classes
  const fetchClasses = useCallback(async (showLoading = false) => {
    try {
      if (showLoading) setClassesLoading(true);
      const data = await api.getClasses();
      setClasses(data);
    } catch (err: any) {
      console.error('Failed to fetch classes:', err);
      // Only show alert if server is down and classes list is empty
      if (classes.length === 0) {
        setAlert({
          type: 'error',
          message: 'সার্ভারের সাথে সংযোগ স্থাপন করা সম্ভব হয়নি। ব্যাকএন্ড চালু আছে কিনা নিশ্চিত করুন।'
        });
      }
    } finally {
      if (showLoading) setClassesLoading(false);
    }
  }, [classes.length]);

  // Fetch student holds
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

  // Initial load
  useEffect(() => {
    fetchClasses(true);
  }, [fetchClasses]);

  // Fetch holds when studentId changes
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

  // Handle Apply for seat (Hold)
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
        message: `${cls.name}-এ আপনার সিট সফলভাবে সাময়িক Hold করা হয়েছে। নির্ধারিত সময়ের মধ্যে ফি দিয়ে ভর্তি নিশ্চিত করুন।`
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

  // Handle Confirm Hold (Payment)
  const handleConfirmHold = async (holdId: string) => {
    try {
      const res = await api.confirmHold(holdId, studentId);
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
        message: 'ভর্তি সফলভাবে নিশ্চিত হয়েছে! আপনার আবেদন ও পেমেন্ট গৃহীত হয়েছে।'
      });
    } catch (err: any) {
      throw err;
    }
  };

  // Handle Cancel Hold
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
        message: 'আবেদনটি সফলভাবে বাতিল করা হয়েছে। সিটটি সাধারণ তালিকার জন্য উন্মুক্ত করা হয়েছে।'
      });
    } catch (err: any) {
      throw err;
    }
  };

  // Handle Admin Create Class
  const handleCreateClass = async (name: string, totalSeats: number) => {
    await api.createClass({ name, totalSeats });
    await fetchClasses(false);
    setAlert({
      type: 'success',
      message: `"${name}" (${totalSeats} সিট) সফলভাবে তৈরি হয়েছে।`
    });
  };

  // Select an existing hold from history to view in modal
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
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Top Header */}
      <Header
        studentId={studentId}
        onStudentIdChange={handleStudentIdChange}
        onOpenCreateClass={() => setIsCreateModalOpen(true)}
      />

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Global Alert Notification */}
        {alert && (
          <AlertBanner
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert(null)}
          />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Class List */}
          <div className="lg:col-span-2 space-y-6">
            <ClassList
              classes={classes}
              studentId={studentId}
              onApply={handleApply}
              applyingClassId={applyingClassId}
              loading={classesLoading}
            />
          </div>

          {/* Right Col: My Applications */}
          <div className="space-y-6">
            <MyHolds
              holds={myHolds}
              studentId={studentId}
              onSelectHold={handleSelectHoldFromHistory}
              loading={holdsLoading}
              onRefresh={fetchMyHolds}
            />

            {/* Quick Helper Box */}
            <div className="bg-blue-50/70 border border-blue-100 rounded-2xl p-4 text-xs text-blue-900 space-y-2">
              <div className="flex items-center gap-2 font-bold text-blue-950">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>ভর্তি প্রক্রিয়ার নিয়মাবলী:</span>
              </div>
              <ul className="list-disc pl-5 space-y-1 text-slate-700">
                <li>আবেদন সফল হলে সিটটি কিছু সময়ের জন্য Hold হবে।</li>
                <li>কাউন্টডাউন শেষ হওয়ার পূর্বেই "ভর্তি ফি দিন" বাটনে চাপুন।</li>
                <li>মেয়াদ শেষ হলে সিটটি স্বয়ংক্রিয়ভাবে বাতিল হয়ে যাবে।</li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      {/* Active Hold Modal (Countdown & Fee payment) */}
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

