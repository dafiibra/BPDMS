import {Env} from '../config/env';

const BASE = Env.apiUrl + '/deposito';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildQuery(params: any): string {
  return Object.entries(params as Record<string, unknown>)
    .filter(([, v]) => v != null && v !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join('&');
}

async function get<T>(url: string): Promise<T> {
  const res = await fetch(url, {headers: {'Accept': 'application/json'}});
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  if (!json.success) throw new Error(json.message ?? 'API error');
  return json.data as T;
}

export interface LevelParams {
  level: string;
  levelId: string;
  snapshotDate?: string;
  periodCode?: string;
  segmentCode?: string;
}

export interface DepositoSummary {
  avgBalance: number;
  avgBalanceTarget: number;
  avgBalanceAchievementPct: number;
  cof: number;
  snapshotDate?: string;
}

export interface DepositoGrowth {
  growthMtd: number;
  growthMom: number;
  growthYtd: number;
  growthYoy: number;
}

export interface DepositoCompositionSegment {
  segmentCode: string;
  segmentName: string;
  endingBalance: number;
  proportion: number;
}

export interface DepositoComposition {
  segments: DepositoCompositionSegment[];
}

export interface DepositoCurrencyItem {
  currencyCode: string;
  label: string;
  endingBalance: number;
  proportion: number;
}

export interface DepositoCurrency {
  currencies: DepositoCurrencyItem[];
}

export const depositoApi = {
  getSummary: (p: LevelParams) =>
    get<DepositoSummary>(`${BASE}/summary?${buildQuery(p)}`),

  getGrowth: (p: LevelParams) =>
    get<DepositoGrowth>(`${BASE}/growth?${buildQuery(p)}`),

  getComposition: (p: LevelParams) =>
    get<DepositoComposition>(`${BASE}/composition?${buildQuery(p)}`),

  getCurrency: (p: LevelParams) =>
    get<DepositoCurrency>(`${BASE}/currency?${buildQuery(p)}`),
};
