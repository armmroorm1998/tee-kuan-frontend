'use client';

import { use, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSession, getGames, createGame, closeSession, generateReceipts, getReceipts, getPlayers } from '@/lib/apiClient';
import { useRouter } from 'next/navigation';
import { PlusCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Receipt } from '@/types';

interface Props { params: Promise<{ squadId: string; sessionId: string }> }

export default function SessionPage({ params }: Props) {
  const { squadId, sessionId } = use(params);
  const router = useRouter();
  const qc = useQueryClient();
  const [showGameForm, setShowGameForm] = useState(false);
  const [courtLabel, setCourtLabel] = useState('');
  const [gamePlayerIds, setGamePlayerIds] = useState<string[]>([]);
  const [showCloseForm, setShowCloseForm] = useState(false);
  const [shuttlesUsed, setShuttlesUsed] = useState('');
  const [courtTotalOverride, setCourtTotalOverride] = useState('');
  const [extraTotal, setExtraTotal] = useState('');

  const { data: session } = useQuery({ queryKey: ['session', sessionId], queryFn: () => getSession(squadId, sessionId) });
  const { data: games = [] } = useQuery({ queryKey: ['games', sessionId], queryFn: () => getGames(sessionId) });
  const { data: players = [] } = useQuery({ queryKey: ['players', squadId], queryFn: () => getPlayers(squadId) });
  const { data: receipts = [] } = useQuery({ queryKey: ['receipts', sessionId], queryFn: () => getReceipts(sessionId), enabled: session?.status === 'closed' });

  const addGameMut = useMutation({
    mutationFn: () => createGame(sessionId, { court_label: courtLabel || undefined, player_ids: gamePlayerIds }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['games', sessionId] }); setShowGameForm(false); setGamePlayerIds([]); setCourtLabel(''); toast.success(`เพิ่มเกมที่ ${games.length + 1} แล้ว`); },
    onError: (e: any) => toast.error(e.message),
  });

  const closeMut = useMutation({
    mutationFn: () => closeSession(squadId, sessionId, {
      shuttles_used: shuttlesUsed ? Number(shuttlesUsed) : undefined,
      court_total: courtTotalOverride ? Number(courtTotalOverride) : undefined,
      extra_total: extraTotal ? Number(extraTotal) : undefined,
    }),
    onSuccess: async () => {
      qc.invalidateQueries({ queryKey: ['session', sessionId] });
      await generateReceiptsMut.mutateAsync();
    },
    onError: (e: any) => toast.error(e.message),
  });

  const generateReceiptsMut = useMutation({
    mutationFn: () => generateReceipts(sessionId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['receipts', sessionId] }); toast.success('ปิด Session และออกใบเสร็จแล้ว!'); },
    onError: (e: any) => toast.error(e.message),
  });

  const toggleGamePlayer = (id: string) => {
    setGamePlayerIds((prev) => prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]);
  };

  const sessionPlayers = session?.session_players ?? [];
  const activePlayers = players.filter((p) => p.is_active);

  if (!session) return <div className="flex justify-center mt-20 text-gray-400">กำลังโหลด...</div>;

  const isClosed = session.status === 'closed';
  const shuttlePriceLabel = session.shuttle_pricing_mode === 'per_shuttle'
    ? `${session.shuttle_price_per_item} บาท/ลูก`
    : `${session.shuttle_price_per_tube} บาท/หลอด (${session.shuttles_per_tube} ลูก/หลอด ≈ ${session.shuttles_per_tube ? (Number(session.shuttle_price_per_tube) / Number(session.shuttles_per_tube)).toFixed(2) : '-'} บาท/ลูก)`;

  return (
    <div className="max-w-lg mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{session.title ?? 'Session'}</h1>
          <p className="text-sm text-gray-400">{session.billing_mode === 'equal_split' ? 'หารเท่ากัน' : 'หารตามเกมส์'} · {shuttlePriceLabel}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${isClosed ? 'bg-gray-100 text-gray-500' : 'bg-green-100 text-green-700'}`}>
          {isClosed ? 'จบแล้ว' : 'กำลังเล่น'}
        </span>
      </div>

      {/* Players in this session */}
      <div className="bg-white rounded-2xl shadow px-5 py-4">
        <h3 className="font-semibold text-gray-700 mb-3 text-sm">ผู้เล่นวันนี้ ({sessionPlayers.length} คน)</h3>
        <div className="flex flex-wrap gap-2">
          {sessionPlayers.map((sp) => (
            <span key={sp.id} className="bg-green-50 text-green-700 border border-green-200 px-3 py-1 rounded-full text-sm">
              {sp.player?.name ?? '?'}
            </span>
          ))}
        </div>
      </div>

      {/* Games */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-700">เกมส์ ({games.length} เกมส์)</h3>
          {!isClosed && (
            <button onClick={() => setShowGameForm(true)} className="flex items-center gap-1 text-green-600 text-sm font-semibold hover:text-green-800">
              <PlusCircle className="w-4 h-4" /> เพิ่มเกมส์
            </button>
          )}
        </div>

        {showGameForm && (
          <div className="bg-white rounded-2xl shadow p-4 space-y-3">
            <h4 className="text-sm font-semibold text-gray-700">เกมส์ที่ {games.length + 1}</h4>
            <input value={courtLabel} onChange={(e) => setCourtLabel(e.target.value)} placeholder="สนาม (เช่น A1) ไม่บังคับ" className={inputCls} maxLength={50} />
            <div>
              <p className="text-sm text-gray-600 mb-2">ผู้เล่นในเกมส์นี้</p>
              <div className="flex flex-wrap gap-2">
                {sessionPlayers.map((sp) => (
                  <button key={sp.player_id} onClick={() => toggleGamePlayer(sp.player_id)}
                    className={`px-3 py-1 rounded-full text-sm border transition ${gamePlayerIds.includes(sp.player_id) ? 'bg-green-600 text-white border-green-600' : 'border-gray-300 text-gray-600'}`}>
                    {sp.player?.name ?? '?'}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => addGameMut.mutate()} disabled={gamePlayerIds.length === 0 || addGameMut.isPending} className="flex-1 bg-green-600 text-white rounded-xl py-2 text-sm font-semibold disabled:opacity-50 hover:bg-green-700 transition">
                {addGameMut.isPending ? 'กำลังบันทึก...' : 'บันทึกเกมส์'}
              </button>
              <button onClick={() => { setShowGameForm(false); setGamePlayerIds([]); }} className="flex-1 border border-gray-300 rounded-xl py-2 text-sm text-gray-600 hover:bg-gray-50">ยกเลิก</button>
            </div>
          </div>
        )}

        {games.map((g) => (
          <div key={g.id} className="bg-white rounded-2xl shadow px-5 py-3">
            <div className="flex items-center justify-between mb-1">
              <span className="font-medium text-gray-700 text-sm">เกมส์ {g.game_number}{g.court_label ? ` · ${g.court_label}` : ''}</span>
              <span className="text-xs text-gray-400">{g.game_players?.length ?? 0} คน</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {g.game_players?.map((gp) => (
                <span key={gp.id} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{gp.player?.name ?? '?'}</span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Close session */}
      {!isClosed && (
        <div className="space-y-3">
          {!showCloseForm ? (
            <button onClick={() => setShowCloseForm(true)} className="w-full bg-red-500 text-white rounded-xl py-3 font-semibold hover:bg-red-600 transition">
              🏁 ปิด Session & คิดเงิน
            </button>
          ) : (
            <div className="bg-white rounded-2xl shadow p-6 space-y-4">
              <h3 className="font-bold text-gray-800">ปิด Session</h3>
              <div>
                <label className="text-sm text-gray-600 block mb-1">จำนวนลูกที่ใช้ (ลูก)</label>
                <input type="number" value={shuttlesUsed} onChange={(e) => setShuttlesUsed(e.target.value)} placeholder="0" className={inputCls} min="0" />
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-1">ค่าสนาม (บาท) — แก้ได้ตอนนี้</label>
                <input type="number" value={courtTotalOverride} onChange={(e) => setCourtTotalOverride(e.target.value)} placeholder={String(session.court_total)} className={inputCls} min="0" />
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-1">ค่าอื่นๆ เพิ่มเติม (บาท)</label>
                <input type="number" value={extraTotal} onChange={(e) => setExtraTotal(e.target.value)} placeholder="0" className={inputCls} min="0" />
              </div>
              <div className="flex gap-2">
                <button onClick={() => closeMut.mutate()} disabled={closeMut.isPending || generateReceiptsMut.isPending} className="flex-1 bg-red-500 text-white rounded-xl py-2 font-semibold text-sm hover:bg-red-600 disabled:opacity-50 transition">
                  {closeMut.isPending || generateReceiptsMut.isPending ? 'กำลังคำนวณ...' : 'ปิดและคิดเงิน'}
                </button>
                <button onClick={() => setShowCloseForm(false)} className="flex-1 border border-gray-300 rounded-xl py-2 text-sm text-gray-600 hover:bg-gray-50">ยกเลิก</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Receipts */}
      {isClosed && receipts.length > 0 && (
        <ReceiptSection receipts={receipts} sessionId={sessionId} />
      )}
    </div>
  );
}

function ReceiptSection({ receipts, sessionId }: { receipts: Receipt[]; sessionId: string }) {
  const qc = useQueryClient();
  const regenMut = useMutation({
    mutationFn: () => generateReceipts(sessionId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['receipts', sessionId] }); toast.success('ออก QR ใหม่แล้ว'); },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-gray-800 text-lg">🧾 ใบเสร็จ</h3>
        <button onClick={() => regenMut.mutate()} disabled={regenMut.isPending} className="text-xs text-gray-400 hover:text-green-600">
          {regenMut.isPending ? 'กำลังออก QR...' : '↻ ออก QR ใหม่'}
        </button>
      </div>
      {receipts.map((r) => (
        <div key={r.id} className="bg-white rounded-2xl shadow p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold text-gray-800">{r.player?.name ?? '?'}</div>
              <div className="text-2xl font-bold text-green-700 mt-0.5">฿{Number(r.amount_due).toFixed(2)}</div>
            </div>
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${r.payment_status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
              {r.payment_status === 'paid' ? 'จ่ายแล้ว' : 'รอโอน'}
            </span>
          </div>
          {r.qr_image_base64 && (
            <div className="flex flex-col items-center gap-2">
              <img src={r.qr_image_base64} alt={`QR PromptPay ${r.player?.name}`} className="w-40 h-40 rounded-xl border" />
              <p className="text-xs text-gray-400">สแกน PromptPay โอน ฿{Number(r.amount_due).toFixed(2)}</p>
            </div>
          )}
          {!r.qr_image_base64 && (
            <p className="text-xs text-gray-400 text-center">ยังไม่ได้ตั้งค่า PromptPay — ไปที่ ตั้งค่า เพื่อเพิ่ม</p>
          )}
        </div>
      ))}
    </div>
  );
}

const inputCls = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500';
