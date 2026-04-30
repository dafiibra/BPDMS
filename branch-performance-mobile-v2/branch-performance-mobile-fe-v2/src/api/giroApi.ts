import {Env} from '../config/env';

const BASE = Env.apiUrl + '/giro';

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

export interface GiroSummary {
  avgBalance: number;
  endingBalance: number;
  cof: number;
  avgBalanceTarget: number;
  endingBalanceTarget: number;
  avgBalanceAchievementPct: number;
  endingBalanceAchievementPct: number;
  snapshotDate: string;
}

export interface GiroGrowth {
  growthMtd: number;
  growthMom: number;
  growthYtd: number;
  growthYoy: number;
}

export interface GiroCompositionSegment {
  segmentCode: string;
  segmentName: string;
  endingBalance: number;
  proportion: number;
}

export interface GiroComposition {
  segments: GiroCompositionSegment[];
}

export interface GiroAcquisition {
  newCif: number;
  newCifTarget: number;
  newCifAchievementPct: number;
  churn: number;
  netCif: number;
  endingBalance: number;
}

export const giroApi = {
  getSummary: (p: LevelParams) =>
    get<GiroSummary>(`${BASE}/summary?${buildQuery(p)}`),

  getGrowth: (p: LevelParams) =>
    get<GiroGrowth>(`${BASE}/growth?${buildQuery(p)}`),

  getComposition: (p: LevelParams) =>
    get<GiroComposition>(`${BASE}/composition?${buildQuery(p)}`),

  getAcquisition: (p: LevelParams & {periodType?: string}) =>
    get<GiroAcquisition>(`${BASE}/acquisition?${buildQuery(p)}`),
};
