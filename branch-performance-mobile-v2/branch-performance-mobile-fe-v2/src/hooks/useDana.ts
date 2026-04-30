import {useEffect, useRef, useState} from 'react';
import {
  danaApi,
  DanaSummary,
  DanaGrowth,
  DanaChart,
  DanaComposition,
  LevelParams,
} from '../api/danaApi';
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

export function useDanaSummary() {
  return useFetch<DanaSummary>(p => danaApi.getSummary(p));
}

export function useDanaGrowth() {
  return useFetch<DanaGrowth>(p => danaApi.getGrowth(p));
}

export function useDanaChart(groupBy = 'MONTHLY') {
  const params = useLevel();
  const [data, setData] = useState<DanaChart | null>(null);
  const [status, setStatus] = useState<Status>('idle');

  useEffect(() => {
    if (!params) return;
    setStatus('loading');
    danaApi
      .getChart({...params, groupBy})
      .then(d => {
        setData(d);
        setStatus('success');
      })
      .catch(() => setStatus('error'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params?.level, params?.levelId, groupBy]);

  return {data, status, loading: status === 'loading'};
}

export function useDanaComposition() {
  return useFetch<DanaComposition>(p => danaApi.getComposition(p));
}

export function useDanaDetail(
  detailLevel: 'AREA' | 'BRANCH',
  metric: 'AVG_BAL' | 'END_BAL',
) {
  const params = useLevel();
  const [data, setData] = useState<import('../api/danaApi').DanaDetail | null>(null);
  const [status, setStatus] = useState<Status>('idle');
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!params) return;
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setStatus('loading');
    danaApi
      .getDetail({...params, detailLevel, metric})
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
  }, [params?.level, params?.levelId, params?.snapshotDate, params?.periodCode, detailLevel, metric]);

  return {data, status, loading: status === 'loading'};
}
