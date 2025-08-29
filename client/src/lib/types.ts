export type BetStatus = 'pending' | 'completed' | 'lost';

export interface Bet {
  id: string;
  userId: string;
  stake: string;
  payout: string;
  profit: string;
  betType: 'surebet' | 'giros' | 'superodd' | 'dnc' | 'gastos' | 'bingos' | 'extracao' | 'vicio';
  status: BetStatus;
  house?: string | null;
  description?: string | null;
  placedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface BetStats {
  totalStake: number;
  totalPayout: number;
  totalProfit: number;
  totalBets: number;
  roi: number;
  profitByDate: Array<{ 
    date: string; 
    profit: number; 
    stake: number; 
    payout: number 
  }>;
}

export interface BetFilters {
  betType?: string;
  house?: string;
  startDate?: string;
  endDate?: string;
  period?: 'daily' | 'monthly' | 'yearly';
  month?: string; // Format: YYYY-MM
  year?: string; // Format: YYYY
}

export const BET_TYPES = {
  surebet: '🎯 Surebet',
  giros: '🎰 Giros grátis',
  superodd: '🚀 Superodd',
  dnc: '💪 DNC',
  gastos: '💸 Gastos',
  bingos: '🎲 Bingos',
  extracao: '🎁 Extração FB',
  vicio: '⚠️ Vício',
} as const;

export type BetTypeKey = keyof typeof BET_TYPES;

export const BETTING_HOUSES = [
  'BRX Bet',
  '7Games',
  'Betão',
  'BullsBet',
  'R7 Bet',
  'SuperBet',
  'Papi Games',
  'B1Bet',
  'OnaBet',
  'MMABet',
  '7K Bet',
  'Esportes da Sorte',
  'DonaldBet',
  'HiperBet',
  'PixBet',
  'ApostaTudo',
  'Bet da Sorte',
  'MultiBet',
  'ObaBet',
  'Vai de Bet',
  'Jogão Bet',
  'Jogo de Ouro',
  'Rei do Pitaco',
  'Esportiva Bet',
  'BetPix365',
  'Up Bet',
  'BetFácil',
  'Betano',
  'BetPonto',
  'Bet365',
  'Cassino Pix',
  'MCGames',
  'BateuBet',
  'Lotogreen',
  'Betboo',
  'KTO',
  'Novibet',
  'Stake',
  'Ux Bet',
  'BetBra',
] as const;
