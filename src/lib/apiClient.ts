import api from './api';
import type {
  Owner,
  Squad,
  Player,
  Session,
  SessionPlayer,
  Game,
  Receipt,
  MonthlySummary,
  BillingMode,
  CourtSplitMode,
  ShuttlePricingMode,
  PromptPayType,
} from '@/types';

// ── Owners ────────────────────────────────────────────────
export const bootstrap = (display_name?: string) =>
  api.post<{ owner: Owner; recovery_key: string }>('/owners/bootstrap', { display_name }).then((r) => r.data);

export const recoverOwner = (recovery_key: string) =>
  api.post<{ owner: Owner }>('/owners/recover', { recovery_key }).then((r) => r.data);

export const getMe = () =>
  api.get<Owner>('/owners/me').then((r) => r.data);

export const updateMe = (data: {
  display_name?: string;
  promptpay_type?: PromptPayType;
  promptpay_value?: string;
}) => api.patch<Owner>('/owners/me', data).then((r) => r.data);

export const logout = () => api.post('/owners/logout');

// ── Squads ────────────────────────────────────────────────
export const createSquad = (data: {
  name: string;
  default_billing_mode?: BillingMode;
  default_court_split_mode?: CourtSplitMode;
}) => api.post<Squad>('/squads', data).then((r) => r.data);

export const getSquads = () =>
  api.get<Squad[]>('/squads').then((r) => r.data);

export const getSquad = (id: string) =>
  api.get<Squad>(`/squads/${id}`).then((r) => r.data);

// ── Players ───────────────────────────────────────────────
export const createPlayer = (squadId: string, data: { name: string; note?: string }) =>
  api.post<Player>(`/squads/${squadId}/players`, data).then((r) => r.data);

export const getPlayers = (squadId: string) =>
  api.get<Player[]>(`/squads/${squadId}/players`).then((r) => r.data);

export const deactivatePlayer = (squadId: string, playerId: string) =>
  api.delete<Player>(`/squads/${squadId}/players/${playerId}`).then((r) => r.data);

// ── Sessions ──────────────────────────────────────────────
export const createSession = (
  squadId: string,
  data: {
    title?: string;
    billing_mode: BillingMode;
    court_split_mode: CourtSplitMode;
    shuttle_pricing_mode: ShuttlePricingMode;
    shuttle_price_per_item?: number;
    shuttle_price_per_tube?: number;
    shuttles_per_tube?: number;
    court_total?: number;
    extra_total?: number;
    player_ids?: string[];
  },
) => api.post<Session>(`/squads/${squadId}/sessions`, data).then((r) => r.data);

export const getSessions = (squadId: string) =>
  api.get<Session[]>(`/squads/${squadId}/sessions`).then((r) => r.data);

export const getSession = (squadId: string, sessionId: string) =>
  api.get<Session>(`/squads/${squadId}/sessions/${sessionId}`).then((r) => r.data);

export const closeSession = (
  squadId: string,
  sessionId: string,
  data: { shuttles_used?: number; court_total?: number; extra_total?: number },
) =>
  api
    .patch<Session>(`/squads/${squadId}/sessions/${sessionId}/close`, data)
    .then((r) => r.data);

// ── Session Players ───────────────────────────────────────
export const addSessionPlayer = (sessionId: string, playerId: string) =>
  api.post<SessionPlayer>(`/sessions/${sessionId}/players`, { player_id: playerId }).then((r) => r.data);

// ── Games ─────────────────────────────────────────────────
export const createGame = (
  sessionId: string,
  data: { court_label?: string; player_ids: string[] },
) => api.post<Game>(`/sessions/${sessionId}/games`, data).then((r) => r.data);

export const getGames = (sessionId: string) =>
  api.get<Game[]>(`/sessions/${sessionId}/games`).then((r) => r.data);

export const deleteGame = (sessionId: string, gameId: string) =>
  api.delete(`/sessions/${sessionId}/games/${gameId}`);

// ── Receipts ──────────────────────────────────────────────
export const generateReceipts = (sessionId: string) =>
  api.post<Receipt[]>(`/sessions/${sessionId}/receipts/generate`).then((r) => r.data);

export const getReceipts = (sessionId: string) =>
  api.get<Receipt[]>(`/sessions/${sessionId}/receipts`).then((r) => r.data);

export const markReceiptPaid = (sessionId: string, receiptId: string) =>
  api.patch<Receipt>(`/sessions/${sessionId}/receipts/${receiptId}/mark-paid`).then((r) => r.data);

export const markReceiptPending = (sessionId: string, receiptId: string) =>
  api.patch<Receipt>(`/sessions/${sessionId}/receipts/${receiptId}/mark-pending`).then((r) => r.data);

// ── Reports ───────────────────────────────────────────────
export const getMonthlySummary = (month: string) =>
  api.get<MonthlySummary>(`/reports/monthly?month=${month}`).then((r) => r.data);
