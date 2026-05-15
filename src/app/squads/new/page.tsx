'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createSquad, createPlayer, createSession } from '@/lib/apiClient';
import { useOwner } from '@/context/OwnerContext';
import toast from 'react-hot-toast';
import { LoadingOverlay } from '@/components/LoadingOverlay';
import { ChevronLeft, X } from 'lucide-react';
import type { BillingMode, CourtSplitMode, ShuttlePricingMode } from '@/types';
const inputCls = 'w-full border border-gray-300 rounded-xl px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white';

type SplitPreset = 'equal' | 'per_game_all' | 'per_game_court_equal';
const SPLIT_PRESETS: { value: SplitPreset; label: string; desc: string }[] = [
  { value: 'equal', label: 'หารเท่ากัน', desc: 'ทุกคนจ่ายเท่ากัน ไม่ว่าจะเล่นกี่เกมส์' },
  { value: 'per_game_all', label: 'หารตามเกมส์', desc: 'ทุกค่าใช้จ่ายหารตามสัดส่วนเกมส์ที่เล่น — เล่นมากจ่ายมาก' },
  { value: 'per_game_court_equal', label: 'ค่าคอร์ตหารเท่า + ค่าลูกตามเกมส์', desc: 'ค่าคอร์ตหารเท่ากันทุกคน ค่าลูกหารตามสัดส่วนเกมส์' },
];
function presetToModes(preset: SplitPreset): { billing_mode: BillingMode; court_split_mode: CourtSplitMode } {
  if (preset === 'per_game_all') return { billing_mode: 'per_game_split', court_split_mode: 'per_game' };
  if (preset === 'per_game_court_equal') return { billing_mode: 'per_game_split', court_split_mode: 'equal' };
  return { billing_mode: 'equal_split', court_split_mode: 'equal' };
}

export default function NewSquadPage() {
  const router = useRouter();
  const { owner, isIdentified, isLoading: ownerLoading } = useOwner();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!ownerLoading && isIdentified && !owner?.promptpay_type) {
      toast.error('กรุณาตั้งค่า PromptPay ก่อนสร้างก๊วน');
      router.replace('/settings');
    }
  }, [ownerLoading, isIdentified, owner, router]);

  const [squadName, setSquadName] = useState('');
  const [players, setPlayers] = useState<string[]>([]);
  const [playerInput, setPlayerInput] = useState('');

  const addPlayer = () => {
    const name = playerInput.trim();
    if (!name) return;
    setPlayers((prev) => [...prev, name]);
    setPlayerInput('');
  };

  const removePlayer = (index: number) => {
    setPlayers((prev) => prev.filter((_, i) => i !== index));
  };
  const [splitPreset, setSplitPreset] = useState<SplitPreset>('equal');
  const [shuttleMode, setShuttleMode] = useState<ShuttlePricingMode>('per_shuttle');
  const [shuttlePrice, setShuttlePrice] = useState('');
  const [tubPrice, setTubPrice] = useState('');
  const [shuttlesPerTub, setShuttlesPerTub] = useState('12');

  const handleSubmit = async () => {
    if (!squadName.trim()) return;
    setSubmitting(true);
    try {
      const { billing_mode, court_split_mode } = presetToModes(splitPreset);
      const squad = await createSquad({
        name: squadName.trim(),
        default_billing_mode: billing_mode,
        default_court_split_mode: court_split_mode,
      });

      const playerResults = await Promise.all(
        players.map((name) => createPlayer(squad.id, { name }))
      );

      const session = await createSession(squad.id, {
        billing_mode: billing_mode,
        court_split_mode: court_split_mode,
        shuttle_pricing_mode: shuttleMode,
        shuttle_price_per_item: shuttleMode === 'per_shuttle' && shuttlePrice ? Number(shuttlePrice) : undefined,
        shuttle_price_per_tube: shuttleMode === 'per_tube' && tubPrice ? Number(tubPrice) : undefined,
        shuttles_per_tube: shuttleMode === 'per_tube' ? Number(shuttlesPerTub) : undefined,
        player_ids: playerResults.map((p) => p.id),
      });

      toast.success('พร้อมเล่นแล้ว! 🏸');
      router.push(`/squads/${squad.id}/sessions/${session.id}`);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto flex flex-col min-h-[calc(100dvh-57px)]">
      {submitting && <LoadingOverlay label="กำลังสร้างก๊วน..." />}
      {/* Header */}
      <div className="px-4 py-3 flex items-center gap-3 border-b border-gray-100 bg-white sticky top-0 z-10">
        <button onClick={() => router.push('/squads')} className="p-1 -ml-1 text-gray-500 hover:text-gray-800 transition">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="font-bold text-gray-800 text-lg">สร้างก๊วนใหม่</h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 pb-32">
        {/* 1. Squad name */}
        <div>
          <label className="text-sm font-semibold text-gray-700 block mb-2">ชื่อก๊วน *</label>
          <input
            value={squadName}
            onChange={(e) => setSquadName(e.target.value)}
            placeholder="เช่น ก๊วนวันศุกร์"
            className={inputCls}
            maxLength={100}
            autoFocus
          />
        </div>

        {/* Divider */}
        <div className="border-t border-gray-100" />

        {/* วิธีแบ่งค่าใช้จ่าย */}
        <div>
          <label className="text-sm font-semibold text-gray-700 block mb-3">วิธีแบ่งค่าใช้จ่าย</label>
          <div className="space-y-2">
            {SPLIT_PRESETS.map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => setSplitPreset(p.value)}
                className={`w-full text-left px-4 py-3 rounded-xl border-2 transition ${splitPreset === p.value ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}
              >
                <div className={`text-sm font-semibold ${splitPreset === p.value ? 'text-green-700' : 'text-gray-700'}`}>{p.label}</div>
                <div className="text-xs text-gray-400 mt-0.5">{p.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* 4. Shuttle pricing */}
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-4">
            <label className="text-sm font-semibold text-gray-700 shrink-0">ตั้งค่าการเงิน</label>
            <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
              <button
                onClick={() => setShuttleMode('per_shuttle')}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition ${shuttleMode === 'per_shuttle' ? 'bg-white shadow text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}
              >
                ราคา / ลูก
              </button>
              <button
                onClick={() => setShuttleMode('per_tube')}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition ${shuttleMode === 'per_tube' ? 'bg-white shadow text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}
              >
                ราคา / หลอด
              </button>
            </div>
          </div>

          {shuttleMode === 'per_shuttle' && (
            <input type="number" value={shuttlePrice} onChange={(e) => setShuttlePrice(e.target.value)} placeholder="ราคาต่อลูก (บาท)" className={inputCls} min="0" />
          )}

          {shuttleMode === 'per_tube' && (
            <div className="space-y-3">
              <input type="number" value={tubPrice} onChange={(e) => setTubPrice(e.target.value)} placeholder="ราคาต่อหลอด (บาท)" className={inputCls} min="0" />
              <input type="number" value={shuttlesPerTub} onChange={(e) => setShuttlesPerTub(e.target.value)} placeholder="จำนวนลูกต่อหลอด" className={inputCls} min="1" />
              {tubPrice && Number(shuttlesPerTub) > 0 && (
                <p className="text-xs text-gray-500">
                  {tubPrice} / {shuttlesPerTub} = <span className="font-semibold text-green-600">{(Number(tubPrice) / Number(shuttlesPerTub)).toFixed(2)} บาท/ลูก</span>
                </p>
              )}
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-gray-100" />

        {/* 5. Players */}
        <div>
          <label className="text-sm font-semibold text-gray-700 block mb-2">ผู้เล่น</label>
          <div className="flex gap-2">
            <input
              value={playerInput}
              onChange={(e) => setPlayerInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') addPlayer(); }}
              placeholder="ชื่อผู้เล่น"
              className="flex-1 border border-gray-300 rounded-xl px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
              maxLength={20}
            />
            <button
              onClick={addPlayer}
              disabled={!playerInput.trim()}
              className="px-4 py-3 bg-green-600 text-white rounded-xl font-semibold text-sm hover:bg-green-700 disabled:opacity-40 transition"
            >
              เพิ่ม
            </button>
          </div>
          {players.length > 0 && (
            <ul className="mt-3 space-y-2">
              {players.map((name, i) => (
                <li key={i} className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                  <span className="text-gray-800">{name}</span>
                  <button onClick={() => removePlayer(i)} className="text-gray-300 hover:text-red-400 transition p-1">
                    <X className="w-5 h-5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
          <p className="text-xs text-gray-400 mt-2">เพิ่มทีหลังได้ในหน้าก๊วน</p>
        </div>
      </div>

      {/* Fixed bottom button */}
      <div className="fixed bottom-0 left-0 right-0 px-4 py-4 bg-white border-t border-gray-100">
        <div className="max-w-lg mx-auto">
          <button
            onClick={handleSubmit}
            disabled={submitting || !squadName.trim()}
            className="w-full bg-green-600 text-white rounded-2xl py-4 font-bold text-lg hover:bg-green-700 disabled:opacity-40 transition"
          >
            {submitting ? 'กำลังสร้าง...' : 'เริ่มเลย! 🏸'}
          </button>
        </div>
      </div>
    </div>
  );
}
