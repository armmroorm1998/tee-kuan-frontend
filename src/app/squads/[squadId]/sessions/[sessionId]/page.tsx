'use client';

import { use, useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSession, getGames, createPlayer, createGame, deleteGame, closeSession, generateReceipts, getReceipts, addSessionPlayer, markReceiptPaid, markReceiptPending } from '@/lib/apiClient';
import { LoadingOverlay } from '@/components/LoadingOverlay';
import { useRouter } from 'next/navigation';
import { ChevronLeft, PlusCircle, Shuffle, UserPlus, Share2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import type { Game, Receipt } from '@/types';

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Pick 4 players (prioritising those who sat out last game) and split into
 *  2 teams of 2 minimising repeated within-team pairings. */
function buildShuffledTeams(livePlayers: string[], games: Game[]): string[] | null {
  if (livePlayers.length < 4) return null;

  const lastGame = games[games.length - 1];
  const lastGameIds = new Set(lastGame?.game_players.map((gp) => gp.player_id) ?? []);

  const sittingOut = shuffleArray(livePlayers.filter((id) => !lastGameIds.has(id)));
  const playedLast = shuffleArray(livePlayers.filter((id) => lastGameIds.has(id)));

  const selected =
    sittingOut.length >= 4
      ? sittingOut.slice(0, 4)
      : [...sittingOut, ...playedLast.slice(0, 4 - sittingOut.length)];

  // Build pairing-frequency map from all game history
  const freq = new Map<string, number>();
  for (const g of games) {
    const ids = g.game_players.map((gp) => gp.player_id);
    for (let i = 0; i < ids.length; i++) {
      for (let j = i + 1; j < ids.length; j++) {
        const key = [ids[i], ids[j]].sort().join('|');
        freq.set(key, (freq.get(key) ?? 0) + 1);
      }
    }
  }

  const pairScore = (x: string, y: string) => freq.get([x, y].sort().join('|')) ?? 0;
  const [a, b, c, d] = selected;

  const splits: [string, string, string, string][] = [
    [a, b, c, d],
    [a, c, b, d],
    [a, d, b, c],
  ];

  return splits.reduce((min, cur) =>
    pairScore(cur[0], cur[1]) + pairScore(cur[2], cur[3]) <
    pairScore(min[0], min[1]) + pairScore(min[2], min[3])
      ? cur
      : min,
  );
}

interface Props { params: Promise<{ squadId: string; sessionId: string }> }

export default function SessionPage({ params }: Props) {
  const { squadId, sessionId } = use(params);
  const router = useRouter();
  const qc = useQueryClient();
  const [showGameForm, setShowGameForm] = useState(false);
  const [courtLabel, setCourtLabel] = useState('');
  const [gamePlayerIds, setGamePlayerIds] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null); // for manual team swap
  const [showCloseForm, setShowCloseForm] = useState(false);
  const [shuttlesUsed, setShuttlesUsed] = useState('');
  const [courtTotalOverride, setCourtTotalOverride] = useState('');
  const [extraTotal, setExtraTotal] = useState('');
  const leftKey = `left_players_${sessionId}`;
  const [leftPlayerIds, setLeftPlayerIds] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem(leftKey);
      return stored ? new Set<string>(JSON.parse(stored)) : new Set<string>();
    } catch {
      return new Set<string>();
    }
  });
  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const [newPlayerName, setNewPlayerName] = useState('');

  const { data: session } = useQuery({ queryKey: ['session', sessionId], queryFn: () => getSession(squadId, sessionId) });
  const { data: games = [] } = useQuery({ queryKey: ['games', sessionId], queryFn: () => getGames(sessionId) });
  const { data: receipts = [], isLoading: receiptsLoading } = useQuery({ queryKey: ['receipts', sessionId], queryFn: () => getReceipts(sessionId), enabled: session?.status === 'closed' });

  const addGameMut = useMutation({
    mutationFn: () => createGame(sessionId, { court_label: courtLabel || undefined, player_ids: gamePlayerIds }),
    onSuccess: async () => { await qc.invalidateQueries({ queryKey: ['games', sessionId] }); setShowGameForm(false); setGamePlayerIds([]); setSelectedSlot(null); setCourtLabel(''); toast.success(`เพิ่มเกมที่ ${games.length + 1} แล้ว`); },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteGameMut = useMutation({
    mutationFn: (gameId: string) => deleteGame(sessionId, gameId),
    onSuccess: async () => { await qc.invalidateQueries({ queryKey: ['games', sessionId] }); toast.success('ลบเกมส์แล้ว'); },
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

  const addPlayerMut = useMutation({
    mutationFn: async (name: string) => {
      const player = await createPlayer(squadId, { name: name.trim() });
      await addSessionPlayer(sessionId, player.id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['session', sessionId] });
      qc.invalidateQueries({ queryKey: ['players', squadId] });
      setNewPlayerName('');
      toast.success('เพิ่มผู้เล่นแล้ว');
    },
    onError: (e: any) => toast.error(e.message),
  });

  const toggleLeft = (playerId: string) => {
    setLeftPlayerIds((prev) => {
      const next = new Set(prev);
      if (next.has(playerId)) {
        next.delete(playerId);
      } else {
        next.add(playerId);
        // ผู้เล่นกลับแล้ว ต้องเอาออกจากรายการที่สุ่มเกมส์ไว้ด้วย
        setGamePlayerIds((ids) => ids.filter((id) => id !== playerId));
      }
      localStorage.setItem(leftKey, JSON.stringify([...next]));
      return next;
    });
  };

  const toggleGamePlayer = (id: string) => {
    setGamePlayerIds((prev) => prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]);
  };

  const sessionPlayers = session?.session_players ?? [];

  if (!session || (session.status === 'closed' && receiptsLoading)) {
    return (
      <div className="max-w-lg mx-auto flex flex-col min-h-[calc(100dvh-57px)]">
        {/* Skeleton header */}
        <div className="px-4 py-3 flex items-center gap-3 border-b border-gray-100 bg-white sticky top-0 z-10">
          <button onClick={() => router.push(`/squads/${squadId}`)} className="p-1 -ml-1 text-gray-500 hover:text-gray-800 transition">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="flex-1 space-y-1.5 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-2/5" />
            <div className="h-3 bg-gray-100 rounded w-3/5" />
          </div>
          <div className="h-6 w-16 bg-gray-100 rounded-full animate-pulse" />
        </div>
        {/* Skeleton content */}
        <div className="flex-1 px-4 py-6 space-y-4 animate-pulse">
          <div className="bg-white rounded-2xl shadow px-5 py-4 space-y-2">
            <div className="h-3 bg-gray-200 rounded w-1/3" />
            <div className="h-4 bg-gray-100 rounded w-1/2" />
            <div className="h-4 bg-gray-100 rounded w-2/5" />
          </div>
          {[...Array(2)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl shadow px-5 py-4 space-y-2">
              <div className="h-3 bg-gray-200 rounded w-1/4" />
              <div className="h-8 bg-gray-100 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const isClosed = session.status === 'closed';
  const shuttlePriceLabel = session.shuttle_pricing_mode === 'per_shuttle'
    ? `${session.shuttle_price_per_item} บาท/ลูก`
    : `${session.shuttle_price_per_tube} บาท/หลอด (${session.shuttles_per_tube} ลูก/หลอด ≈ ${session.shuttles_per_tube ? (Number(session.shuttle_price_per_tube) / Number(session.shuttles_per_tube)).toFixed(2) : '-'} บาท/ลูก)`;

  return (
    <div className="max-w-lg mx-auto flex flex-col min-h-[calc(100dvh-57px)]">
      {(closeMut.isPending || generateReceiptsMut.isPending) && <LoadingOverlay label="กำลังปิด Session..." />}
      {addGameMut.isPending && <LoadingOverlay label="กำลังบันทึกเกมส์..." />}
      {addPlayerMut.isPending && <LoadingOverlay label="กำลังเพิ่มผู้เล่น..." />}
      {deleteGameMut.isPending && <LoadingOverlay label="กำลังลบเกมส์..." />}
      {/* Sticky header */}
      <div className="px-4 py-3 flex items-center gap-3 border-b border-gray-100 bg-white sticky top-0 z-10">
        <button onClick={() => router.push(`/squads/${squadId}`)} className="p-1 -ml-1 text-gray-500 hover:text-gray-800 transition">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="font-bold text-gray-800 text-lg leading-tight truncate">{session.title ?? 'Session'}</h1>
          <p className="text-xs text-gray-400">{session.billing_mode === 'equal_split' ? 'หารเท่ากัน' : 'หารตามเกมส์'} · {shuttlePriceLabel}</p>
        </div>
        <span className={`shrink-0 px-3 py-1 rounded-full text-xs font-semibold ${isClosed ? 'bg-gray-100 text-gray-500' : 'bg-green-100 text-green-700'}`}>
          {isClosed ? 'จบแล้ว' : 'กำลังเล่น'}
        </span>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">

      {/* Players in this session */}
      <div className="bg-white rounded-2xl shadow px-5 py-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-700 text-sm">ผู้เล่นวันนี้ ({sessionPlayers.length} คน)</h3>
          {!isClosed && (
            <button onClick={() => setShowAddPlayer((v) => !v)} className="flex items-center gap-1 text-green-600 text-sm font-semibold hover:text-green-800">
              <UserPlus className="w-4 h-4" /> เพิ่มผู้เล่น
            </button>
          )}
        </div>

        {/* Add player panel */}
        {showAddPlayer && (
          <div className="mb-3 p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
            <div className="flex gap-2">
              <input
                value={newPlayerName}
                onChange={(e) => setNewPlayerName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && newPlayerName.trim()) addPlayerMut.mutate(newPlayerName); }}
                placeholder="ชื่อผู้เล่น"
                className="flex-1 border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                maxLength={20}
                autoFocus
              />
              <button
                onClick={() => addPlayerMut.mutate(newPlayerName)}
                disabled={!newPlayerName.trim() || addPlayerMut.isPending}
                className="px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 disabled:opacity-40 transition"
              >
                {addPlayerMut.isPending ? '...' : 'เพิ่ม'}
              </button>
            </div>
          </div>
        )}

        {/* Player rows */}
        <div className="space-y-2">
          {sessionPlayers.map((sp) => {
            const isLeft = leftPlayerIds.has(sp.player_id);
            return (
              <div key={sp.id} className="flex items-center justify-between gap-2">
                <span className={`text-sm font-medium ${isLeft ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                  {sp.player?.name ?? '?'}
                </span>
                {!isClosed && (
                  <div className="flex bg-gray-100 rounded-lg p-0.5 gap-0.5 shrink-0">
                    <button
                      onClick={() => isLeft && toggleLeft(sp.player_id)}
                      className={`px-3 py-1 rounded-md text-xs font-semibold transition ${!isLeft ? 'bg-white shadow text-green-700' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                      Live
                    </button>
                    <button
                      onClick={() => !isLeft && toggleLeft(sp.player_id)}
                      className={`px-3 py-1 rounded-md text-xs font-semibold transition ${isLeft ? 'bg-white shadow text-gray-600' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                      กลับแล้ว
                    </button>
                  </div>
                )}
              </div>
            );
          })}
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
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-gray-700">เกมส์ที่ {games.length + 1}</h4>
              <button
                onClick={() => {
                  const livePlayers = sessionPlayers
                    .filter((sp) => !leftPlayerIds.has(sp.player_id))
                    .map((sp) => sp.player_id);
                  const result = buildShuffledTeams(livePlayers, games);
                  if (!result) { toast.error('ผู้เล่น Live ไม่ถึง 4 คน'); return; }
                  setGamePlayerIds(result);
                  setSelectedSlot(null);
                }}
                className="flex items-center gap-1 text-purple-600 text-sm font-semibold hover:text-purple-800 transition"
              >
                <Shuffle className="w-4 h-4" /> สุ่มทีม
              </button>
            </div>
            <input value={courtLabel} onChange={(e) => setCourtLabel(e.target.value)} placeholder="สนาม (เช่น A1) ไม่บังคับ" className={inputCls} maxLength={50} />
            <div>
              <p className="text-sm text-gray-600 mb-2">ผู้เล่นในเกมส์นี้</p>
              <div className="flex flex-wrap gap-2">
                {sessionPlayers.filter((sp) => !leftPlayerIds.has(sp.player_id)).map((sp) => (
                  <button key={sp.player_id} onClick={() => toggleGamePlayer(sp.player_id)}
                    className={`px-3 py-1 rounded-full text-sm border transition ${gamePlayerIds.includes(sp.player_id) ? 'bg-green-600 text-white border-green-600' : 'border-gray-300 text-gray-600'}`}>
                    {sp.player?.name ?? '?'}
                  </button>
                ))}
              </div>
            </div>

            {/* Team assignment UI — shows when 4 players selected */}
            {gamePlayerIds.length === 4 && (
              <div className="border border-gray-100 rounded-xl p-3 space-y-2">
                <p className="text-xs text-gray-500 font-medium">จัดทีม — แตะ 2 คนเพื่อสลับตำแหน่ง{selectedSlot !== null ? ' (เลือกแล้ว ✓ แตะคนที่ 2 เพื่อสลับ)' : ''}</p>
                {(['A', 'B'] as const).map((team, ti) => {
                  const slots = ti === 0 ? [0, 1] : [2, 3];
                  const colors = ti === 0
                    ? { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', sel: 'ring-2 ring-blue-400' }
                    : { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', sel: 'ring-2 ring-red-400' };
                  return (
                    <div key={team} className="flex items-center gap-2">
                      <span className={`text-xs font-bold w-8 shrink-0 ${colors.text}`}>ทีม {team}</span>
                      {slots.map((slotIdx) => {
                        const pid = gamePlayerIds[slotIdx];
                        const name = sessionPlayers.find((sp) => sp.player_id === pid)?.player?.name ?? '?';
                        const isSelected = selectedSlot === slotIdx;
                        return (
                          <button
                            key={slotIdx}
                            onClick={() => {
                              if (selectedSlot === null) {
                                setSelectedSlot(slotIdx);
                              } else if (selectedSlot === slotIdx) {
                                setSelectedSlot(null);
                              } else {
                                // swap
                                const next = [...gamePlayerIds];
                                [next[selectedSlot], next[slotIdx]] = [next[slotIdx], next[selectedSlot]];
                                setGamePlayerIds(next);
                                setSelectedSlot(null);
                              }
                            }}
                            className={`flex-1 text-xs font-medium px-2 py-1.5 rounded-lg border transition ${colors.bg} ${colors.text} ${colors.border} ${isSelected ? colors.sel : ''}`}
                          >
                            {name}
                          </button>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            )}
            {gamePlayerIds.length > 0 && gamePlayerIds.length !== 4 && (
              <p className="text-xs text-amber-600">เลือกผู้เล่นให้ครบ 4 คน (เลือกแล้ว {gamePlayerIds.length} คน)</p>
            )}
            <div className="flex gap-2">
              <button onClick={() => addGameMut.mutate()} disabled={gamePlayerIds.length !== 4 || addGameMut.isPending} className="flex-1 bg-green-600 text-white rounded-xl py-2 text-sm font-semibold disabled:opacity-50 hover:bg-green-700 transition">
                {addGameMut.isPending ? 'กำลังบันทึก...' : 'บันทึกเกมส์'}
              </button>
              <button onClick={() => { setShowGameForm(false); setGamePlayerIds([]); setSelectedSlot(null); }} className="flex-1 border border-gray-300 rounded-xl py-2 text-sm text-gray-600 hover:bg-gray-50">ยกเลิก</button>
            </div>
          </div>
        )}

        {games.map((g) => {
          const players = g.game_players ?? [];
          const teamA = players.slice(0, 2);
          const teamB = players.slice(2, 4);
          return (
            <div key={g.id} className="bg-white rounded-2xl shadow px-5 py-3">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-700 text-sm">เกมส์ {g.game_number}{g.court_label ? ` · ${g.court_label}` : ''}</span>
                {!isClosed && (
                  <button
                    onClick={async () => {
                      const result = await Swal.fire({
                        title: `ลบเกมส์ ${g.game_number}?`,
                        text: 'การลบไม่สามารถย้อนกลับได้',
                        icon: 'warning',
                        showCancelButton: true,
                        confirmButtonColor: '#ef4444',
                        cancelButtonColor: '#6b7280',
                        confirmButtonText: 'ลบเลย',
                        cancelButtonText: 'ยกเลิก',
                      });
                      if (result.isConfirmed) deleteGameMut.mutate(g.id);
                    }}
                    className="text-red-400 hover:text-red-600 transition p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 flex flex-col gap-1">
                  {teamA.map((gp) => (
                    <span key={gp.id} className="text-xs bg-blue-50 text-blue-700 border border-blue-100 px-3 py-1 rounded-lg text-center font-medium">{gp.player?.name ?? '?'}</span>
                  ))}
                </div>
                <span className="text-xs font-bold text-gray-400 shrink-0">VS</span>
                <div className="flex-1 flex flex-col gap-1">
                  {teamB.map((gp) => (
                    <span key={gp.id} className="text-xs bg-red-50 text-red-700 border border-red-100 px-3 py-1 rounded-lg text-center font-medium">{gp.player?.name ?? '?'}</span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
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
                  {closeMut.isPending || generateReceiptsMut.isPending ? '...' : 'ปิดและคิดเงิน'}
                </button>
                <button onClick={() => setShowCloseForm(false)} className="flex-1 border border-gray-300 rounded-xl py-2 text-sm text-gray-600 hover:bg-gray-50">ยกเลิก</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Receipts */}
      {isClosed && receipts.length > 0 && (
        <ReceiptSection receipts={receipts} sessionId={sessionId} games={games} />
      )}
      </div>
    </div>
  );
}

async function shareReceipt(playerName: string, amount: number, base64: string | null) {
  if (!navigator.share) return;
  try {
    if (base64 && navigator.canShare?.({ files: [new File([], '')] })) {
      const res = await fetch(base64);
      const blob = await res.blob();
      const file = new File([blob], `promptpay-${playerName}.png`, { type: 'image/png' });
      await navigator.share({
        title: `PromptPay สำหรับ ${playerName}`,
        text: `โอน ฿${amount.toFixed(2)} มาให้ด้วยนะ 🏸`,
        files: [file],
      });
    } else {
      await navigator.share({
        text: `${playerName} โอน ฿${amount.toFixed(2)} ผ่าน PromptPay ด้วยนะ 🙏`,
      });
    }
  } catch {
    // user cancelled
  }
}

function ReceiptSection({ receipts, sessionId, games }: { receipts: Receipt[]; sessionId: string; games: Game[] }) {
  const qc = useQueryClient();

  const gamesPlayedMap = useMemo(() => {
    const map = new Map<string, number>();
    games.forEach((g) => {
      g.game_players.forEach((gp) => {
        map.set(gp.player_id, (map.get(gp.player_id) ?? 0) + 1);
      });
    });
    return map;
  }, [games]);
  const regenMut = useMutation({
    mutationFn: () => generateReceipts(sessionId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['receipts', sessionId] }); toast.success('ออก QR ใหม่แล้ว'); },
    onError: (e: any) => toast.error(e.message),
  });

  const togglePaidMut = useMutation({
    mutationFn: (r: Receipt) =>
      r.payment_status === 'paid'
        ? markReceiptPending(sessionId, r.id)
        : markReceiptPaid(sessionId, r.id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['receipts', sessionId] }),
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div className="space-y-4">
      {regenMut.isPending && <LoadingOverlay label="กำลังออก QR..." />}
      {togglePaidMut.isPending && <LoadingOverlay label="กำลังอัปเดต..." />}
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
              <div className="text-xs text-gray-400 mt-0.5">{gamesPlayedMap.get(r.player_id) ?? 0} เกมส์</div>
              <div className="text-2xl font-bold text-green-700 mt-0.5">฿{Number(r.amount_due).toFixed(2)}</div>
            </div>
            <button
              onClick={() => togglePaidMut.mutate(r)}
              disabled={togglePaidMut.isPending}
              className={`text-xs px-3 py-1.5 rounded-full font-semibold transition ${r.payment_status === 'paid' ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-amber-100 text-amber-700 hover:bg-amber-200'}`}
            >
              {r.payment_status === 'paid' ? '✓ จ่ายแล้ว' : 'รอโอน'}
            </button>
          </div>
          {r.qr_image_base64 && (
            <div className="flex flex-col items-center gap-2">
              <img src={r.qr_image_base64} alt={`QR PromptPay ${r.player?.name}`} className="w-40 h-40 rounded-xl border" />
              <p className="text-xs text-gray-400">สแกน PromptPay โอน ฿{Number(r.amount_due).toFixed(2)}</p>
              {typeof navigator !== 'undefined' && !!navigator.share && (
                <button
                  onClick={() => shareReceipt(r.player?.name ?? '?', Number(r.amount_due), r.qr_image_base64)}
                  className="flex items-center gap-1.5 text-sm text-green-600 font-semibold hover:text-green-800 transition"
                >
                  <Share2 className="w-4 h-4" /> แชร์ให้ผู้เล่น
                </button>
              )}
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

const inputCls = 'w-full border border-gray-300 rounded-xl px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white';
