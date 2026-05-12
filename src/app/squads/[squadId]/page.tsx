'use client';

import { use, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSquad, getPlayers, createPlayer, deactivatePlayer, getSessions } from '@/lib/apiClient';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, UserMinus, Calendar, Plus, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface Props { params: Promise<{ squadId: string }> }

export default function SquadDetailPage({ params }: Props) {
  const { squadId } = use(params);
  const router = useRouter();
  const qc = useQueryClient();
  const [tab, setTab] = useState<'sessions' | 'players'>('sessions');
  const [showPlayerForm, setShowPlayerForm] = useState(false);
  const [playerName, setPlayerName] = useState('');

  const { data: squad } = useQuery({ queryKey: ['squad', squadId], queryFn: () => getSquad(squadId) });
  const { data: players = [] } = useQuery({ queryKey: ['players', squadId], queryFn: () => getPlayers(squadId) });
  const { data: sessions = [] } = useQuery({ queryKey: ['sessions', squadId], queryFn: () => getSessions(squadId) });

  const addPlayerMut = useMutation({
    mutationFn: () => createPlayer(squadId, { name: playerName }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['players', squadId] });
      setPlayerName('');
      setShowPlayerForm(false);
      toast.success('เพิ่มผู้เล่นแล้ว');
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deactivateMut = useMutation({
    mutationFn: (pid: string) => deactivatePlayer(squadId, pid),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['players', squadId] }); toast.success('นำผู้เล่นออกแล้ว'); },
    onError: (e: any) => toast.error(e.message),
  });

  const activePlayers = players.filter((p) => p.is_active);

  return (
    <div className="max-w-lg mx-auto flex flex-col min-h-[calc(100dvh-57px)]">
      {/* Header */}
      <div className="px-4 py-3 flex items-center gap-3 border-b border-gray-100 bg-white sticky top-0 z-10">
        <button onClick={() => router.push('/squads')} className="p-1 -ml-1 text-gray-500 hover:text-gray-800 transition">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="font-bold text-gray-800 text-lg leading-tight">{squad?.name ?? '...'}</h1>
          <p className="text-xs text-gray-400">
            {squad?.default_billing_mode === 'equal_split' ? 'หารเท่ากัน' : 'หารตามเกมส์'} · {squad?.default_court_split_mode === 'equal' ? 'ค่าสนามหารเท่ากัน' : 'ค่าสนามหารตามเกมส์'}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 pt-4">
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
          {(['sessions', 'players'] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`flex-1 rounded-lg py-2 text-sm font-semibold transition ${tab === t ? 'bg-white shadow text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}>
              {t === 'sessions' ? '🏸 Session' : '👤 ผู้เล่น'}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-28 space-y-3">
        {tab === 'sessions' && (
          sessions.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <Calendar className="w-10 h-10 mx-auto opacity-30 mb-2" />
              <p>ยังไม่มี session</p>
              <p className="text-sm mt-1">กดปุ่มด้านล่างเพื่อเริ่มเลย</p>
            </div>
          ) : (
            sessions.map((s) => (
              <button key={s.id} onClick={() => router.push(`/squads/${squadId}/sessions/${s.id}`)}
                className="w-full bg-white rounded-2xl shadow px-5 py-4 flex items-center justify-between hover:shadow-md transition text-left">
                <div>
                  <div className="font-semibold text-gray-800">{s.title ?? new Date(s.created_at).toLocaleDateString('th-TH')}</div>
                  <div className="mt-0.5">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${s.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {s.status === 'active' ? 'กำลังเล่น' : 'จบแล้ว'}
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-300" />
              </button>
            ))
          )
        )}

        {tab === 'players' && (
          <>
            {showPlayerForm ? (
              <div className="bg-white rounded-2xl shadow p-4 flex gap-2">
                <input
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && playerName.trim() && addPlayerMut.mutate()}
                  placeholder="ชื่อผู้เล่น"
                  className="flex-1 border border-gray-300 rounded-xl px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  maxLength={100}
                  autoFocus
                />
                <button onClick={() => addPlayerMut.mutate()} disabled={!playerName.trim() || addPlayerMut.isPending} className="bg-green-600 text-white rounded-xl px-4 text-base font-semibold disabled:opacity-50 hover:bg-green-700 transition">เพิ่ม</button>
                <button onClick={() => { setShowPlayerForm(false); setPlayerName(''); }} className="text-gray-400 hover:text-gray-600 px-2"><X className="w-5 h-5" /></button>
              </div>
            ) : (
              <button onClick={() => setShowPlayerForm(true)} className="w-full flex items-center justify-center gap-2 border border-green-600 text-green-700 rounded-2xl py-3 font-semibold hover:bg-green-50 transition">
                <Plus className="w-4 h-4" /> เพิ่มผู้เล่น
              </button>
            )}

            {activePlayers.map((p) => (
              <div key={p.id} className="bg-white rounded-2xl shadow px-5 py-4 flex items-center justify-between">
                <span className="font-medium text-gray-800">{p.name}</span>
                <button onClick={() => { if (confirm(`นำ ${p.name} ออกจากก๊วน?`)) deactivateMut.mutate(p.id); }} className="text-gray-300 hover:text-red-400 transition">
                  <UserMinus className="w-4 h-4" />
                </button>
              </div>
            ))}

            {activePlayers.length === 0 && !showPlayerForm && (
              <div className="text-center py-12 text-gray-400">ยังไม่มีผู้เล่น</div>
            )}
          </>
        )}
      </div>

      {tab === 'sessions' && (
        <div className="fixed bottom-0 left-0 right-0 px-4 py-4 bg-white border-t border-gray-100">
          <div className="max-w-lg mx-auto">
            <button
              onClick={() => router.push(`/squads/${squadId}/sessions/new`)}
              className="w-full bg-green-600 text-white rounded-2xl py-4 font-bold text-lg hover:bg-green-700 transition"
            >
              🏸 เริ่ม Session ใหม่
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
