'use client';

import { useQuery } from '@tanstack/react-query';
import { getSquads } from '@/lib/apiClient';
import { LoadingPage } from '@/components/LoadingOverlay';
import { useOwner } from '@/context/OwnerContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { ChevronLeft, ChevronRight, Users, Plus } from 'lucide-react';

export default function SquadsPage() {
  const { isIdentified, isLoading: ownerLoading } = useOwner();
  const router = useRouter();

  useEffect(() => {
    if (!ownerLoading && !isIdentified) router.replace('/');
  }, [ownerLoading, isIdentified, router]);

  const { data: squads = [], isLoading } = useQuery({
    queryKey: ['squads'],
    queryFn: getSquads,
    enabled: isIdentified,
  });

  if (ownerLoading || isLoading) {
    return <LoadingPage />;
  }
  if (!isIdentified) return null;

  return (
    <div className="max-w-lg mx-auto flex flex-col min-h-dvh">
      {/* Header */}
      <div className="px-4 py-3 flex items-center gap-3 border-b border-gray-100 bg-white sticky top-0 z-10">
        <button onClick={() => router.push('/')} className="p-1 -ml-1 text-gray-500 hover:text-gray-800 transition">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="font-bold text-gray-800 text-lg">ก๊วนของฉัน</h1>
      </div>

      <div className="flex-1 px-4 pt-6 pb-28">

      {squads.length === 0 ? (
        <div className="text-center py-20 text-gray-400 space-y-2">
          <Users className="w-12 h-12 mx-auto opacity-30" />
          <p>ยังไม่มีก๊วน</p>
          <p className="text-sm">กดปุ่มด้านล่างเพื่อสร้างก๊วนแรก</p>
        </div>
      ) : (
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
      )}

      </div>

      <div className="fixed bottom-0 left-0 right-0 px-4 py-4 bg-white border-t border-gray-100">
        <div className="max-w-lg mx-auto">
          <button
            onClick={() => router.push('/squads/new')}
            className="w-full bg-green-600 text-white rounded-2xl py-4 font-bold text-lg hover:bg-green-700 transition flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" /> สร้างก๊วนใหม่
          </button>
        </div>
      </div>
    </div>
  );
}
