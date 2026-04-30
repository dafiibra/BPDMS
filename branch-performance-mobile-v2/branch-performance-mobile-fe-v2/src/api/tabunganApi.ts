import {Env} from '../config/env';

const BASE_TAB = Env.apiUrl + '/tabungan';
const BASE_NTB = Env.apiUrl + '/ntb';

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

export interface TabunganSummary {
  avgBalance: number;
  endingBalance: number;
  cof: number;
  avgBalanceTarget: number;
  endingBalanceTarget: number;
  avgBalanceAchievementPct: number;
  endingBalanceAchievementPct: number;
  snapshotDate: string;
}

export interface TabunganGrowth {
  growthMtd: number;
  growthMom: number;
  growthYtd: number;
  growthYoy: number;
}

export interface TabunganChart {
  labels: string[];
  endingBalance: number[];
  prevEndingBalance: number[];
  avgBalance: number[];
  prevAvgBalance: number[];
}

export interface TabunganCompositionSegment {
  segmentCode: string;
  segmentName: string;
  endingBalance: number;
  proportion: number;
}

export interface TabunganComposition {
  segments: TabunganCompositionSegment[];
}

export interface TabunganMetrics {
  delta5Days: number;
  retailProportion: number;
  retailProportionDelta: number;
}

export interface NtbSegment {
  segmentCode: string;
  segmentName: string;
  achievementPct: number;
  total: number;
  newAccount: number;
  target: number;
  live: number;
  churn: number;
  net: number;
}

export interface NtbSummary {
  periodType: string;
  total: {
    total: number;
    newAccount: number;
    target: number;
    live: number;
    churn: number;
    net: number;
  };
  segments: NtbSegment[];
}

export const tabunganApi = {
  getSummary: (p: LevelParams) =>
    get<TabunganSummary>(`${BASE_TAB}/summary?${buildQuery(p)}`),

  getGrowth: (p: LevelParams) =>
    get<TabunganGrowth>(`${BASE_TAB}/growth?${buildQuery(p)}`),

  getChart: (p: LevelParams & {groupBy?: string}) =>
    get<TabunganChart>(`${BASE_TAB}/chart?${buildQuery(p)}`),

  getComposition: (p: LevelParams & {growthPeriod?: string}) =>
    get<TabunganComposition>(`${BASE_TAB}/composition?${buildQuery(p)}`),

  getMetrics: (p: LevelParams) =>
    get<TabunganMetrics>(`${BASE_TAB}/metrics?${buildQuery(p)}`),
};

export const ntbApi = {
  getSummary: (p: LevelParams & {periodType?: string}) =>
    get<NtbSummary>(`${BASE_NTB}/summary?${buildQuery(p)}`),
};
