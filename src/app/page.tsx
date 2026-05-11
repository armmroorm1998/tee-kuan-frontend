'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { bootstrap, recoverOwner } from '@/lib/apiClient';
import { useOwner } from '@/context/OwnerContext';
import toast from 'react-hot-toast';

export default function HomePage() {
  const { owner, isLoading, refresh } = useOwner();
  const router = useRouter();
  const [mode, setMode] = useState<'idle' | 'new' | 'recover'>('idle');
  const [displayName, setDisplayName] = useState('');
  const [recoveryKey, setRecoveryKey] = useState('');
  const [recoveryKeyShown, setRecoveryKeyShown] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && owner) router.replace('/squads');
  }, [isLoading, owner, router]);

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
      router.push('/squads');
    } catch (e: any) { toast.error(e.message); }
    finally { setSubmitting(false); }
  };

  if (isLoading) return <div className="flex justify-center mt-20 text-gray-400">กำลังโหลด...</div>;

  if (recoveryKeyShown) {
    return (
      <div className="max-w-md mx-auto mt-20 px-4">
        <div className="bg-white rounded-2xl shadow p-8 text-center space-y-4">
          <div className="text-4xl">🏸</div>
          <h2 className="text-xl font-bold text-gray-800">บันทึก Recovery Key ไว้ด้วยนะ!</h2>
          <p className="text-sm text-gray-500">ถ้าเปลี่ยนเครื่องหรือเบราว์เซอร์ ใช้ key นี้เพื่อดึงข้อมูลก๊วนคืน</p>
          <div className="bg-amber-50 border border-amber-300 rounded-xl px-6 py-4 font-mono text-lg font-bold tracking-widest text-amber-800 break-all">{recoveryKeyShown}</div>
          <p className="text-xs text-red-500">⚠️ key นี้จะแสดงครั้งเดียวเท่านั้น กรุณาจดไว้ก่อน</p>
          <button onClick={() => router.push('/squads')} className="w-full bg-green-600 text-white rounded-xl py-3 font-semibold hover:bg-green-700 transition">จดแล้ว ไปต่อเลย →</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-16 px-4 space-y-6">
      <div className="text-center space-y-3">
        <div className="text-6xl">🏸</div>
        <h1 className="text-3xl font-bold text-gray-800">ตีก๊วน</h1>
        <p className="text-gray-500 text-sm">จัดการก๊วนแบดมินตัน คิดเงิน ออกใบเสร็จ และ QR PromptPay รายคน</p>
      </div>

      {mode === 'idle' && (
        <div className="space-y-3">
          <button onClick={() => setMode('new')} className="w-full bg-green-600 text-white rounded-xl py-4 font-semibold text-lg hover:bg-green-700 transition">เริ่มใช้งานใหม่</button>
          <button onClick={() => setMode('recover')} className="w-full border border-gray-300 text-gray-700 rounded-xl py-4 font-semibold hover:bg-gray-50 transition">กู้คืนด้วย Recovery Key</button>
        </div>
      )}

      {mode === 'new' && (
        <div className="bg-white rounded-2xl shadow p-6 space-y-4">
          <h2 className="font-bold text-gray-800">เริ่มใช้งาน</h2>
          <div>
            <label className="text-sm text-gray-600 block mb-1">ชื่อของคุณ (ไม่บังคับ)</label>
            <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="เช่น น้องอาร์ม" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" maxLength={100} />
          </div>
          <button onClick={handleBootstrap} disabled={submitting} className="w-full bg-green-600 text-white rounded-xl py-3 font-semibold hover:bg-green-700 disabled:opacity-50 transition">{submitting ? 'กำลังสร้าง...' : 'สร้างบัญชี'}</button>
          <button onClick={() => setMode('idle')} className="w-full text-sm text-gray-400 hover:text-gray-600">ย้อนกลับ</button>
        </div>
      )}

      {mode === 'recover' && (
        <div className="bg-white rounded-2xl shadow p-6 space-y-4">
          <h2 className="font-bold text-gray-800">กู้คืนด้วย Recovery Key</h2>
          <input type="text" value={recoveryKey} onChange={(e) => setRecoveryKey(e.target.value)} placeholder="XXXXXX-XXXXXX-XXXXXX-XXXXXX" className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          <button onClick={handleRecover} disabled={submitting || !recoveryKey.trim()} className="w-full bg-green-600 text-white rounded-xl py-3 font-semibold hover:bg-green-700 disabled:opacity-50 transition">{submitting ? 'กำลังตรวจสอบ...' : 'กู้คืน'}</button>
          <button onClick={() => setMode('idle')} className="w-full text-sm text-gray-400 hover:text-gray-600">ย้อนกลับ</button>
        </div>
      )}
    </div>
  );
}
