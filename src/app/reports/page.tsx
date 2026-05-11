'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getMonthlySummary } from '@/lib/apiClient';
import { useOwner } from '@/context/OwnerContext';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';

function toMonthStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export default function ReportsPage() {
  const { isIdentified, isLoading: ownerLoading } = useOwner();
  const router = useRouter();
  const [month, setMonth] = useState(toMonthStr(new Date()));

  const { data, isLoading } = useQuery({
    queryKey: ['monthly', month],
    queryFn: () => getMonthlySummary(month),
    enabled: isIdentified,
  });

  if (ownerLoading) return <div className="flex justify-center mt-20 text-gray-400">กำลังโหลด...</div>;
  if (!isIdentified) { router.replace('/'); return null; }

  const changeMonth = (delta: number) => {
    const [y, m] = month.split('-').map(Number);
    const d = new Date(y, m - 1 + delta, 1);
    setMonth(toMonthStr(d));
  };

  const thMonth = new Date(month + '-01').toLocaleDateString('th-TH', { month: 'long', year: 'numeric' });

  return (
    <div className="max-w-lg mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">สรุปรายเดือน</h1>

      {/* Month navigator */}
      <div className="flex items-center justify-between bg-white rounded-2xl shadow px-5 py-3">
        <button onClick={() => changeMonth(-1)} className="p-1 hover:bg-gray-100 rounded-lg">
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
        <span className="font-semibold text-gray-700">{thMonth}</span>
        <button onClick={() => changeMonth(1)} disabled={month >= toMonthStr(new Date())} className="p-1 hover:bg-gray-100 rounded-lg disabled:opacity-30">
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {isLoading && <div className="text-center text-gray-400 py-8">กำลังโหลด...</div>}

      {data && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-2xl shadow px-5 py-4 text-center">
              <div className="text-3xl font-bold text-green-700">{data.total_sessions}</div>
              <div className="text-sm text-gray-500 mt-1">Session</div>
            </div>
            <div className="bg-white rounded-2xl shadow px-5 py-4 text-center">
              <div className="text-3xl font-bold text-green-700">฿{data.total_cost.toFixed(0)}</div>
              <div className="text-sm text-gray-500 mt-1">รวมค่าใช้จ่าย</div>
            </div>
          </div>

          {data.sessions.length === 0 ? (
            <div className="text-center py-12 text-gray-400">ไม่มี session ในเดือนนี้</div>
          ) : (
            <div className="space-y-3">
              {data.sessions.map((s) => (
                <div key={s.id} className="bg-white rounded-2xl shadow px-5 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-gray-800">{s.title ?? 'Session'}</div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        {s.ended_at ? new Date(s.ended_at).toLocaleDateString('th-TH') : ''} · {s.player_count} คน
                      </div>
                    </div>
                    <div className="font-bold text-green-700">฿{s.total_cost.toFixed(0)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
