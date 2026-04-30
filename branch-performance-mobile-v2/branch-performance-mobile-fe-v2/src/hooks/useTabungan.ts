import {useEffect, useRef, useState} from 'react';
import {
  tabunganApi, ntbApi,
  TabunganSummary, TabunganGrowth, TabunganChart,
  TabunganComposition, TabunganMetrics, NtbSummary,
  LevelParams,
} from '../api/tabunganApi';
import {useLevelContext} from '../context/LevelContext';

type Status = 'idle' | 'loading' | 'success' | 'error';

function useLevel(): LevelParams | null {
  const {level, levelId, snapshotDate, periodCode, isReady} = useLevelContext();
  if (!isReady || !levelId) return null;
  return {level, levelId, snapshotDate, periodCode};
}

function useFetch<T>(fetcher: (p: LevelParams) => Promise<T>) {
  const params = useLevel();
  const [data, setData] = useState<T | null>(null);
  const [status, setStatus] = useState<Status>('idle');
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!params) return;
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setStatus('loading');
    fetcher(params)
      .then(d => {
        if (ctrl.signal.aborted) return;
        setData(d);
        setStatus('success');
      })
      .catch(() => {
        if (!ctrl.signal.aborted) setStatus('error');
      });
    return () => ctrl.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params?.level, params?.levelId, params?.snapshotDate, params?.periodCode]);

  return {data, status, loading: status === 'loading'};
}

export function useTabunganSummary() {
  return useFetch<TabunganSummary>(p => tabunganApi.getSummary(p));
}

export function useTabunganGrowth() {
  return useFetch<TabunganGrowth>(p => tabunganApi.getGrowth(p));
}

export function useTabunganChart(groupBy = 'MONTHLY') {
  const params = useLevel();
  const [data, setData] = useState<TabunganChart | null>(null);
  const [status, setStatus] = useState<Status>('idle');

  useEffect(() => {
    if (!params) return;
    setStatus('loading');
    tabunganApi
      .getChart({...params, groupBy})
      .then(d => { setData(d); setStatus('success'); })
      .catch(() => setStatus('error'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params?.level, params?.levelId, groupBy]);

  return {data, status, loading: status === 'loading'};
}

export function useTabunganComposition(growthPeriod = 'MTD') {
  const params = useLevel();
  const [data, setData] = useState<TabunganComposition | null>(null);
  const [status, setStatus] = useState<Status>('idle');

  useEffect(() => {
    if (!params) return;
    setStatus('loading');
    tabunganApi
      .getComposition({...params, growthPeriod})
      .then(d => { setData(d); setStatus('success'); })
      .catch(() => setStatus('error'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params?.level, params?.levelId, growthPeriod]);

  return {data, status, loading: status === 'loading'};
}

export function useTabunganMetrics() {
  return useFetch<TabunganMetrics>(p => tabunganApi.getMetrics(p));
}

export function useNtbSummary(periodType = 'MTD') {
  const params = useLevel();
  const [data, setData] = useState<NtbSummary | null>(null);
  const [status, setStatus] = useState<Status>('idle');

  useEffect(() => {
    if (!params) return;
    setStatus('loading');
    ntbApi
      .getSummary({...params, periodType})
      .then(d => { setData(d); setStatus('success'); })
      .catch(() => setStatus('error'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params?.level, params?.levelId, periodType]);

  return {data, status, loading: status === 'loading'};
}
