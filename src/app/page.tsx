'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { bootstrap, recoverOwner, logout } from '@/lib/apiClient';
import { LoadingPage, LoadingOverlay } from '@/components/LoadingOverlay';
import { useOwner } from '@/context/OwnerContext';
import toast from 'react-hot-toast';
import { ChevronRight, BarChart2, Settings, LogOut, Feather, Copy, Check, BookOpen } from 'lucide-react';

const inputCls = 'w-full border border-gray-300 rounded-xl px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-green-500';

export default function HomePage() {
  const { owner, isLoading, refresh, clear } = useOwner();
  const router = useRouter();
  const [mode, setMode] = useState<'idle' | 'new' | 'recover'>('idle');
  const [displayName, setDisplayName] = useState('');
  const [recoveryKey, setRecoveryKey] = useState('');
  const [recoveryKeyShown, setRecoveryKeyShown] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleBootstrap = async () => {
    setSubmitting(true);
    try {
      const res = await bootstrap(displayName || undefined);
      setRecoveryKeyShown(res.recovery_key);
      await refresh();
    } catch (e: any) { toast.error(e.message); }
    finally { setSubmitting(false); }
  };

  const handleRecover = async () => {
    if (!recoveryKey.trim()) return;
    setSubmitting(true);
    try {
      await recoverOwner(recoveryKey.trim());
      await refresh();
      setMode('idle');
    } catch (e: any) { toast.error(e.message); }
    finally { setSubmitting(false); }
  };

  const handleLogout = async () => {
    await logout();
    clear();
  };

  if (isLoading) return <LoadingPage />;

  // ── Recovery key shown (must be before owner check) ───
  if (recoveryKeyShown) {
    return (
      <div className="max-w-md mx-auto min-h-dvh flex items-center px-4">
        <div className="w-full bg-white rounded-2xl shadow p-8 text-center space-y-4">
          <div className="text-4xl">🏸</div>
          <h2 className="text-xl font-bold text-gray-800">บันทึก Recovery Key ไว้ด้วยนะ!</h2>
          <p className="text-sm text-gray-500">ถ้าเปลี่ยนเครื่องหรือเบราว์เซอร์ ใช้ key นี้เพื่อดึงข้อมูลก๊วนคืน</p>
          <div className="bg-amber-50 border border-amber-300 rounded-xl px-6 py-4 font-mono text-lg font-bold tracking-widest text-amber-800 break-all">{recoveryKeyShown}</div>
          <button
            onClick={() => {
              navigator.clipboard.writeText(recoveryKeyShown);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            className="w-full flex items-center justify-center gap-2 border border-amber-300 text-amber-700 rounded-xl py-2.5 font-semibold hover:bg-amber-50 transition"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'คัดลอกแล้ว!' : 'คัดลอก Recovery Key'}
          </button>
          <p className="text-xs text-red-500">⚠️ key นี้จะแสดงครั้งเดียวเท่านั้น กรุณาจดไว้ก่อน</p>
          <button onClick={() => setRecoveryKeyShown('')} className="w-full bg-green-600 text-white rounded-xl py-3 font-semibold hover:bg-green-700 transition">จดแล้ว เข้าใช้งานเลย →</button>
        </div>
      </div>
    );
  }

  // ── Dashboard (logged in) ──────────────────────────────
  if (owner) {
    return (
      <div className="max-w-lg mx-auto min-h-dvh flex flex-col">
        {submitting && <LoadingOverlay />}
        {/* App header */}
        <div className="px-5 pt-10 pb-6">
          <div className="flex items-center gap-2 mb-1">
            <Feather className="w-6 h-6 text-green-600" />
            <span className="text-xl font-bold text-green-700">ตีก๊วน</span>
          </div>
          <p className="text-gray-400 text-sm">
            สวัสดี{owner.display_name ? ` ${owner.display_name}` : ''} 👋
          </p>
        </div>

        {/* Feature cards */}
        <div className="flex-1 px-4 space-y-3">
          <button
            onClick={() => router.push('/squads')}
            className="w-full bg-white rounded-2xl shadow px-5 py-5 flex items-center justify-between hover:shadow-md transition text-left"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-2xl">🏸</div>
              <div>
                <div className="font-bold text-gray-800 text-base">ก๊วนของฉัน</div>
                <div className="text-xs text-gray-400 mt-0.5">จัดการก๊วน สร้าง session บันทึกเกมส์</div>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-300 shrink-0" />
          </button>

          <button
            onClick={() => router.push('/reports')}
            className="w-full bg-white rounded-2xl shadow px-5 py-5 flex items-center justify-between hover:shadow-md transition text-left"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                <BarChart2 className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <div className="font-bold text-gray-800 text-base">สรุปรายเดือน</div>
                <div className="text-xs text-gray-400 mt-0.5">ดูค่าใช้จ่ายและสถิติย้อนหลัง</div>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-300 shrink-0" />
          </button>

          <button
            onClick={() => router.push('/settings')}
            className="w-full bg-white rounded-2xl shadow px-5 py-5 flex items-center justify-between hover:shadow-md transition text-left"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                <Settings className="w-6 h-6 text-gray-500" />
              </div>
              <div>
                <div className="font-bold text-gray-800 text-base">ตั้งค่า</div>
                <div className="text-xs text-gray-400 mt-0.5">ชื่อ, PromptPay, Recovery Key</div>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-300 shrink-0" />
          </button>

          <button
            onClick={() => router.push('/how-to-use')}
            className="w-full bg-white rounded-2xl shadow px-5 py-5 flex items-center justify-between hover:shadow-md transition text-left"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-purple-500" />
              </div>
              <div>
                <div className="font-bold text-gray-800 text-base">วิธีใช้งาน</div>
                <div className="text-xs text-gray-400 mt-0.5">คู่มือการใช้งานตั้งแต่ต้นจนจบ</div>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-300 shrink-0" />
          </button>
        </div>

        {/* Logout */}
        <div className="px-4 py-8">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 text-gray-400 hover:text-red-500 py-3 text-sm transition"
          >
            <LogOut className="w-4 h-4" /> ออกจากระบบ
          </button>
        </div>
      </div>
    );
  }

  // ── Login ──────────────────────────────────────────────
  return (
    <div className="max-w-md mx-auto min-h-dvh flex flex-col justify-center px-4 pb-16 space-y-6">
      <div className="text-center space-y-3">
        <div className="text-6xl">🏸</div>
        <h1 className="text-3xl font-bold text-gray-800">ตีก๊วน</h1>
        <p className="text-gray-700 font-medium text-base leading-relaxed">
          ช่วยจัดการก๊วนแบดมินตันตั้งแต่ต้นจนจบ
        </p>
        <div className="flex flex-wrap justify-center gap-2 text-xs text-gray-500">
          <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full">🔀 สุ่มทีม</span>
          <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full">📋 บันทึกเกม</span>
          <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full">💰 คำนวณค่าใช้จ่าย</span>
          <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full">📲 QR PromptPay รายคน</span>
        </div>
        <p className="text-gray-400 text-xs">ไม่ต้องนั่งคิดค่าใช้จ่ายเอง</p>
      </div>

      {mode === 'idle' && (
        <div className="space-y-3">
          <button onClick={() => setMode('new')} className="w-full bg-green-600 text-white rounded-2xl py-4 font-bold text-lg hover:bg-green-700 transition">เริ่มใช้งานใหม่</button>
          <button onClick={() => setMode('recover')} className="w-full border border-gray-300 text-gray-700 rounded-2xl py-4 font-semibold hover:bg-gray-50 transition">กู้คืนด้วย Recovery Key</button>
          <button onClick={() => router.push('/how-to-use')} className="w-full flex items-center justify-center gap-2 text-purple-600 py-2 text-sm font-medium hover:text-purple-800 transition">
            <BookOpen className="w-4 h-4" /> ดูวิธีใช้งาน
          </button>
        </div>
      )}

      {mode === 'new' && (
        <div className="bg-white rounded-2xl shadow p-6 space-y-4">
          <h2 className="font-bold text-gray-800">เริ่มใช้งาน</h2>
          <div>
            <label className="text-sm text-gray-600 block mb-1">ชื่อของคุณ (ไม่บังคับ)</label>
            <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="เช่น น้องอาร์ม" className={inputCls} maxLength={100} />
          </div>
          <button onClick={handleBootstrap} disabled={submitting} className="w-full bg-green-600 text-white rounded-xl py-3 font-semibold hover:bg-green-700 disabled:opacity-50 transition">{submitting ? 'กำลังสร้าง...' : 'สร้างบัญชี'}</button>
          <button onClick={() => setMode('idle')} className="w-full text-sm text-gray-400 hover:text-gray-600">ย้อนกลับ</button>
        </div>
      )}

      {mode === 'recover' && (
        <div className="bg-white rounded-2xl shadow p-6 space-y-4">
          <h2 className="font-bold text-gray-800">กู้คืนด้วย Recovery Key</h2>
          <input type="text" value={recoveryKey} onChange={(e) => setRecoveryKey(e.target.value)} placeholder="XXXXXX-XXXXXX-XXXXXX-XXXXXX" className={`${inputCls} font-mono`} />
          <button onClick={handleRecover} disabled={submitting || !recoveryKey.trim()} className="w-full bg-green-600 text-white rounded-xl py-3 font-semibold hover:bg-green-700 disabled:opacity-50 transition">{submitting ? 'กำลังตรวจสอบ...' : 'กู้คืน'}</button>
          <button onClick={() => setMode('idle')} className="w-full text-sm text-gray-400 hover:text-gray-600">ย้อนกลับ</button>
        </div>
      )}
    </div>
  );
}
