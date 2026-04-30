import {Env} from '../config/env';

const BASE = Env.apiUrl + '/org';

export interface OrgRegion {
  id: string;
  regionCode: string;
  regionName: string;
}

export interface OrgArea {
  id: string;
  areaCode: string;
  areaName: string;
}

export interface OrgBranch {
  id: string;
  branchCode: string;
  branchName: string;
}

async function get<T>(url: string): Promise<T> {
  const res = await fetch(url, {headers: {'Accept': 'application/json'}});
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  if (!json.success) throw new Error(json.message ?? 'API error');
  return json.data as T;
}

export const orgApi = {
  getRegions: () => get<OrgRegion[]>(`${BASE}/regions`),
  getAreas: (regionId: string) => get<OrgArea[]>(`${BASE}/areas?regionId=${regionId}`),
  getBranches: (areaId: string) => get<OrgBranch[]>(`${BASE}/branches?areaId=${areaId}`),
};
