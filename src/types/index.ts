export type BillingMode = 'equal_split' | 'per_game_split';
export type CourtSplitMode = 'equal' | 'per_game';
export type ShuttlePricingMode = 'per_shuttle' | 'per_tube';
export type SessionStatus = 'active' | 'closed';
export type PaymentStatus = 'pending' | 'paid';
export type PromptPayType = 'mobile' | 'national_id';

export interface Owner {
  id: string;
  display_name: string | null;
  promptpay_type: PromptPayType | null;
  created_at: string;
  updated_at: string;
}

export interface Squad {
  id: string;
  name: string;
  owner_id: string;
  default_billing_mode: BillingMode;
  default_court_split_mode: CourtSplitMode;
  players?: Player[];
  created_at: string;
  updated_at: string;
}

export interface Player {
  id: string;
  squad_id: string;
  name: string;
  note: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SessionPlayer {
  id: string;
  session_id: string;
  player_id: string;
  player: Player;
  participation_units: number;
  amount_due: number | null;
  payment_status: PaymentStatus;
}

export interface Game {
  id: string;
  session_id: string;
  game_number: number;
  court_label: string | null;
  created_at: string;
  game_players: { id: string; player_id: string; player?: Player }[];
}

export interface Session {
  id: string;
  squad_id: string;
  title: string | null;
  billing_mode: BillingMode;
  court_split_mode: CourtSplitMode;
  shuttle_pricing_mode: ShuttlePricingMode;
  shuttle_price_per_item: number | null;
  shuttle_price_per_tube: number | null;
  shuttles_per_tube: number | null;
  shuttles_used: number;
  court_total: number;
  extra_total: number;
  status: SessionStatus;
  started_at: string | null;
  ended_at: string | null;
  created_at: string;
  session_players?: SessionPlayer[];
  games?: Game[];
}

export interface Receipt {
  id: string;
  session_id: string;
  player_id: string;
  player: Player;
  amount_due: number;
  promptpay_payload: string | null;
  qr_image_base64: string | null;
  payment_status: PaymentStatus;
  generated_at: string;
}

export interface MonthlySummary {
  month: string;
  total_sessions: number;
  total_cost: number;
  sessions: {
    id: string;
    title: string | null;
    started_at: string | null;
    ended_at: string | null;
    player_count: number;
    total_cost: number;
  }[];
}
