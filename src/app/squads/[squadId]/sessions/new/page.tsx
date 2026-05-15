'use client';

import { use, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getSquad, getPlayers, createSession } from '@/lib/apiClient';
import { LoadingOverlay } from '@/components/LoadingOverlay';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import type { BillingMode, CourtSplitMode, ShuttlePricingMode } from '@/types';
import { CustomSelect } from '@/components/CustomSelect';

interface Props { params: Promise<{ squadId: string }> }

const inputCls = 'w-full border border-gray-300 rounded-xl px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white';

export default function NewSessionPage({ params }: Props) {
  const { squadId } = use(params);
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const [shuttleMode, setShuttleMode] = useState<ShuttlePricingMode>('per_shuttle');
  const [shuttlePrice, setShuttlePrice] = useState('');
  const [tubPrice, setTubPrice] = useState('');
  const [shuttlesPerTub, setShuttlesPerTub] = useState('12');
  const [selectedIds, setSelectedIds] = useState<string[] | null>(null); // null = not yet initialized
  const [billingMode, setBillingMode] = useState<BillingMode | null>(null);
  const [courtMode, setCourtMode] = useState<CourtSplitMode | null>(null);

  const { data: squad } = useQuery({ queryKey: ['squad', squadId], queryFn: () => getSquad(squadId) });
  const { data: players = [], isSuccess } = useQuery({
    queryKey: ['players', squadId],
    queryFn: () => getPlayers(squadId),
  });

  // Pre-select all active players once loaded
  const activePlayers = players.filter((p) => p.is_active);
  const effectiveIds: string[] = selectedIds ?? activePlayers.map((p) => p.id);

  if (isSuccess && selectedIds === null) {
    setSelectedIds(activePlayers.map((p) => p.id));
  }

  // Init billing/court mode from squad defaults once loaded
  if (squad && billingMode === null) setBillingMode(squad.default_billing_mode);
  if (squad && courtMode === null) setCourtMode(squad.default_court_split_mode);

  const effectiveBillingMode: BillingMode = billingMode ?? 'equal_split';
  const effectiveCourtMode: CourtSplitMode = courtMode ?? 'equal';

  const togglePlayer = (id: string) => {
    setSelectedIds((prev) =>
      (prev ?? []).includes(id) ? (prev ?? []).filter((p) => p !== id) : [...(prev ?? []), id]
    );
  };

  const handleSubmit = async () => {
    if (!squad) return;
    setSubmitting(true);
    try {
      const session = await createSession(squadId, {
        billing_mode: effectiveBillingMode,
        court_split_mode: effectiveCourtMode,
        shuttle_pricing_mode: shuttleMode,
        shuttle_price_per_item: shuttleMode === 'per_shuttle' && shuttlePrice ? Number(shuttlePrice) : undefined,
        shuttle_price_per_tube: shuttleMode === 'per_tube' && tubPrice ? Number(tubPrice) : undefined,
        shuttles_per_tube: shuttleMode === 'per_tube' ? Number(shuttlesPerTub) : undefined,
        player_ids: effectiveIds,
      });
      toast.success('เริ่ม session แล้ว! 🏸');
      router.push(`/squads/${squadId}/sessions/${session.id}`);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto flex flex-col min-h-[calc(100dvh-57px)]">
      {submitting && <LoadingOverlay label="กำลังสร้าง Session..." />}
      {/* Header */}
      <div className="px-4 py-3 flex items-center gap-3 border-b border-gray-100 bg-white sticky top-0 z-10">
        <button onClick={() => router.push(`/squads/${squadId}`)} className="p-1 -ml-1 text-gray-500 hover:text-gray-800 transition">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="font-bold text-gray-800 text-lg leading-tight">Session ใหม่</h1>
          <p className="text-xs text-gray-400">{squad?.name}</p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 pb-32">
        {/* Court mode + Billing mode */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-2">กำหนดค่าสนาม</label>
            <CustomSelect
              value={effectiveCourtMode}
              onChange={(v) => setCourtMode(v as CourtSplitMode)}
              options={[
                { value: 'equal', label: 'หารเท่ากัน' },
                { value: 'per_game', label: 'หารตามเกมส์' },
              ]}
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-2">โหมดการคิดเงิน</label>
            <CustomSelect
              value={effectiveBillingMode}
              onChange={(v) => setBillingMode(v as BillingMode)}
              options={[
                { value: 'equal_split', label: 'หารเท่ากัน' },
                { value: 'per_game_split', label: 'หารตามเกมส์' },
              ]}
            />
          </div>
        </div>

        <div className="border-t border-gray-100" />

        <div>
          <label className="text-sm font-semibold text-gray-700 block mb-2">การคิดค่าลูก</label>
          <CustomSelect
            value={shuttleMode}
            onChange={(v) => setShuttleMode(v as ShuttlePricingMode)}
            options={[
              { value: 'per_shuttle', label: 'ราคา / ลูก' },
              { value: 'per_tube', label: 'ราคา / หลอด' },
            ]}
          />
        </div>

        {shuttleMode === 'per_shuttle' && (
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-2">ราคาต่อลูก (บาท)</label>
            <input type="number" value={shuttlePrice} onChange={(e) => setShuttlePrice(e.target.value)} placeholder="เช่น 25" className={inputCls} min="0" />
          </div>
        )}

        {shuttleMode === 'per_tube' && (
          <>
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-2">ราคาต่อหลอด (บาท)</label>
              <input type="number" value={tubPrice} onChange={(e) => setTubPrice(e.target.value)} placeholder="เช่น 300" className={inputCls} min="0" />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-2">จำนวนลูกต่อหลอด</label>
              <input type="number" value={shuttlesPerTub} onChange={(e) => setShuttlesPerTub(e.target.value)} placeholder="12" className={inputCls} min="1" />
            </div>
          </>
        )}

        {activePlayers.length > 0 && (
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-3">ผู้เล่นวันนี้</label>
            <div className="flex flex-wrap gap-2">
              {activePlayers.map((p) => (
                <button
                  key={p.id}
                  onClick={() => togglePlayer(p.id)}
                  className={`px-4 py-2 rounded-full text-base border transition ${
                    effectiveIds.includes(p.id)
                      ? 'bg-green-600 text-white border-green-600'
                      : 'border-gray-300 text-gray-500 hover:border-green-400'
                  }`}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {activePlayers.length === 0 && (
          <p className="text-sm text-gray-400">ยังไม่มีผู้เล่นในก๊วน — เพิ่มได้ในหน้าก๊วน</p>
        )}
      </div>

      {/* Fixed bottom button */}
      <div className="fixed bottom-0 left-0 right-0 px-4 py-4 bg-white border-t border-gray-100">
        <div className="max-w-lg mx-auto">
          <button
            onClick={handleSubmit}
            disabled={submitting || !squad}
            className="w-full bg-green-600 text-white rounded-2xl py-4 font-bold text-lg hover:bg-green-700 disabled:opacity-40 transition"
          >
            {submitting ? 'กำลังสร้าง...' : 'เริ่ม! 🏸'}
          </button>
        </div>
      </div>
    </div>
  );
}
