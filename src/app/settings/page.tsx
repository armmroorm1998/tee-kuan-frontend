'use client';

import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { updateMe } from '@/lib/apiClient';
import { useOwner } from '@/context/OwnerContext';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import type { PromptPayType } from '@/types';

export default function SettingsPage() {
  const { owner, isIdentified, isLoading: ownerLoading, refresh } = useOwner();
  const router = useRouter();

  const [displayName, setDisplayName] = useState('');
  const [promptpayType, setPromptpayType] = useState<PromptPayType>('mobile');
  const [promptpayValue, setPromptpayValue] = useState('');
  const [promptpayInput, setPromptpayInput] = useState('');

  useEffect(() => {
    if (owner) {
      setDisplayName(owner.display_name ?? '');
      if (owner.promptpay_type) setPromptpayType(owner.promptpay_type);
    }
  }, [owner]);

  const updateMut = useMutation({
    mutationFn: () => updateMe({
      display_name: displayName || undefined,
      promptpay_type: promptpayInput ? promptpayType : undefined,
      promptpay_value: promptpayInput || undefined,
    }),
    onSuccess: async () => {
      await refresh();
      setPromptpayInput('');
      toast.success('บันทึกแล้ว!');
    },
    onError: (e: any) => toast.error(e.message),
  });

  if (ownerLoading) return <div className="flex justify-center mt-20 text-gray-400">กำลังโหลด...</div>;
  if (!isIdentified) { router.replace('/'); return null; }

  return (
    <div className="max-w-lg mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">ตั้งค่า</h1>

      <div className="bg-white rounded-2xl shadow p-6 space-y-5">
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">ชื่อของคุณ</label>
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="เช่น น้องอาร์ม"
            className={inputCls}
            maxLength={100}
          />
        </div>

        <hr />

        <div className="space-y-3">
          <h3 className="font-semibold text-gray-700">PromptPay สำหรับรับเงิน</h3>
          <p className="text-xs text-gray-400">ตั้งครั้งเดียว ใบเสร็จทุกใบจะมี QR ตามยอดของแต่ละคนอัตโนมัติ</p>

          {owner?.promptpay_type && (
            <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-700">
              ✓ ตั้งค่า PromptPay ไว้แล้ว ({owner.promptpay_type === 'mobile' ? 'เบอร์มือถือ' : 'เลขบัตรประชาชน'})
            </div>
          )}

          <div>
            <label className="text-sm text-gray-600 block mb-1">ประเภท</label>
            <select value={promptpayType} onChange={(e) => setPromptpayType(e.target.value as PromptPayType)} className={inputCls}>
              <option value="mobile">เบอร์มือถือ (10 หลัก)</option>
              <option value="national_id">เลขบัตรประชาชน (13 หลัก)</option>
            </select>
          </div>

          <div>
            <label className="text-sm text-gray-600 block mb-1">
              {promptpayType === 'mobile' ? 'เบอร์มือถือ' : 'เลขบัตรประชาชน'}
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={promptpayInput}
              onChange={(e) => setPromptpayInput(e.target.value.replace(/\D/g, ''))}
              placeholder={promptpayType === 'mobile' ? '0812345678' : '1234567890123'}
              className={inputCls}
              maxLength={promptpayType === 'mobile' ? 10 : 13}
            />
            <p className="text-xs text-gray-400 mt-1">เก็บเป็นความลับ ไม่แสดงในใบเสร็จ</p>
          </div>
        </div>

        <button
          onClick={() => updateMut.mutate()}
          disabled={updateMut.isPending}
          className="w-full bg-green-600 text-white rounded-xl py-3 font-semibold hover:bg-green-700 disabled:opacity-50 transition"
        >
          {updateMut.isPending ? 'กำลังบันทึก...' : 'บันทึก'}
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow p-6 space-y-3">
        <h3 className="font-semibold text-gray-700 text-sm">ข้อมูลบัญชี</h3>
        <div className="text-xs text-gray-400 space-y-1">
          <p>ID: <span className="font-mono">{owner?.id}</span></p>
          <p>สร้างเมื่อ: {owner?.created_at ? new Date(owner.created_at).toLocaleDateString('th-TH') : '-'}</p>
        </div>
        <p className="text-xs text-amber-600 bg-amber-50 rounded-lg p-3">
          💡 ถ้าต้องการใช้งานบนเครื่องอื่น ให้ใช้ Recovery Key ที่ได้รับตอนสมัคร
        </p>
      </div>
    </div>
  );
}

const inputCls = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500';
