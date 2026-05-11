'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSquads, createSquad } from '@/lib/apiClient';
import { useOwner } from '@/context/OwnerContext';
import { useRouter } from 'next/navigation';
import { PlusCircle, ChevronRight, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import type { BillingMode, CourtSplitMode } from '@/types';

export default function SquadsPage() {
  const { isIdentified, isLoading: ownerLoading } = useOwner();
  const router = useRouter();
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [billingMode, setBillingMode] = useState<BillingMode>('equal_split');
  const [courtMode, setCourtMode] = useState<CourtSplitMode>('equal');

  const { data: squads = [], isLoading } = useQuery({
    queryKey: ['squads'],
    queryFn: getSquads,
    enabled: isIdentified,
  });

  const createMut = useMutation({
    mutationFn: () => createSquad({ name, default_billing_mode: billingMode, default_court_split_mode: courtMode }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['squads'] });
      setShowForm(false);
      setName('');
      toast.success('สร้างก๊วนแล้ว!');
    },
    onError: (e: any) => toast.error(e.message),
  });

  if (ownerLoading || isLoading) {
    return <div className="flex justify-center mt-20 text-gray-400">กำลังโหลด...</div>;
  }
  if (!isIdentified) {
    router.replace('/');
    return null;
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">ก๊วนของฉัน</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1 bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-green-700 transition"
        >
          <PlusCircle className="w-4 h-4" /> สร้างก๊วน
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl shadow p-6 space-y-4">
          <h2 className="font-bold text-gray-800">สร้างก๊วนใหม่</h2>
          <div>
            <label className="text-sm text-gray-600 block mb-1">ชื่อก๊วน *</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="เช่น ก๊วนวันศุกร์"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              maxLength={100}
            />
          </div>
          <div>
            <label className="text-sm text-gray-600 block mb-1">โหมดการคิดเงิน (default)</label>
            <select
              value={billingMode}
              onChange={(e) => setBillingMode(e.target.value as BillingMode)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="equal_split">หารเท่ากัน</option>
              <option value="per_game_split">หารตามเกมส์</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-600 block mb-1">โหมดการคิดค่าสนาม (default)</label>
            <select
              value={courtMode}
              onChange={(e) => setCourtMode(e.target.value as CourtSplitMode)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="equal">หารเท่ากัน</option>
              <option value="per_game">หารตามเกมส์</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => createMut.mutate()}
              disabled={!name.trim() || createMut.isPending}
              className="flex-1 bg-green-600 text-white rounded-xl py-2 font-semibold hover:bg-green-700 disabled:opacity-50 transition text-sm"
            >
              {createMut.isPending ? 'กำลังสร้าง...' : 'สร้าง'}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="flex-1 border border-gray-300 rounded-xl py-2 text-sm text-gray-600 hover:bg-gray-50"
            >
              ยกเลิก
            </button>
          </div>
        </div>
      )}

      {squads.length === 0 && !showForm && (
        <div className="text-center py-16 text-gray-400 space-y-2">
          <Users className="w-12 h-12 mx-auto opacity-30" />
          <p>ยังไม่มีก๊วน กดสร้างก๊วนได้เลย</p>
        </div>
      )}

      <div className="space-y-3">
        {squads.map((s) => (
          <button
            key={s.id}
            onClick={() => router.push(`/squads/${s.id}`)}
            className="w-full bg-white rounded-2xl shadow px-5 py-4 flex items-center justify-between hover:shadow-md transition text-left"
          >
            <div>
              <div className="font-semibold text-gray-800">{s.name}</div>
              <div className="text-xs text-gray-400 mt-0.5">
                {s.default_billing_mode === 'equal_split' ? 'หารเท่ากัน' : 'หารตามเกมส์'}
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-300" />
          </button>
        ))}
      </div>
    </div>
  );
}
