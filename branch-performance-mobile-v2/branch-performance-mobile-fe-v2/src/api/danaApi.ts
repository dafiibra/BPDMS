import {Env} from '../config/env';

const BASE = Env.apiUrl + '/dana';

export interface LevelParams {
  level: string;
  levelId: string;
  snapshotDate?: string;
  periodCode?: string;
  segmentCode?: string;
}

export interface DanaSummary {
  avgBalance: number;
  endingBalance: number;
  cof: number;
  avgBalanceTarget: number;
  endingBalanceTarget: number;
  avgBalanceAchievementPct: number;
  endingBalanceAchievementPct: number;
  snapshotDate: string;
}

export interface DanaGrowth {
  growthMtd: number;
  growthMom: number;
  growthYtd: number;
  growthYoy: number;
}

export interface DanaChart {
  labels: string[];
  endingBalance: number[];
  avgBalance: number[];
}

export interface DanaCompositionSegment {
  segmentCode: string;
  segmentName: string;
  endingBalance: number;
  proportion: number;
}

export interface DanaComposition {
  segments: DanaCompositionSegment[];
}

export interface DanaDetailItem {
  code: string;
  name: string;
  avgBalance: number;
  endingBalance: number;
  target: number;
  achievementPct: number;
  cof: number;
}

export interface DanaDetail {
  items: DanaDetailItem[];
}

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

export const danaApi = {
  getSummary: (p: LevelParams) =>
    get<DanaSummary>(`${BASE}/summary?${buildQuery(p)}`),

  getGrowth: (p: LevelParams) =>
    get<DanaGrowth>(`${BASE}/growth?${buildQuery(p)}`),

  getChart: (p: LevelParams & {groupBy?: string}) =>
    get<DanaChart>(`${BASE}/chart?${buildQuery(p)}`),

  getComposition: (p: LevelParams & {displayMode?: string}) =>
    get<DanaComposition>(`${BASE}/composition?${buildQuery(p)}`),

  getDetail: (p: LevelParams & {detailLevel?: string; metric?: string}) =>
    get<DanaDetail>(`${BASE}/detail?${buildQuery(p)}`),
};
