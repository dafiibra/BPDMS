import {useEffect, useRef, useState} from 'react';
import {
  giroApi,
  GiroSummary, GiroGrowth, GiroComposition, GiroAcquisition,
  LevelParams,
} from '../api/giroApi';
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

export function useGiroSummary() {
  return useFetch<GiroSummary>(p => giroApi.getSummary(p));
}

export function useGiroGrowth() {
  return useFetch<GiroGrowth>(p => giroApi.getGrowth(p));
}

export function useGiroComposition() {
  return useFetch<GiroComposition>(p => giroApi.getComposition(p));
}

export function useGiroAcquisition(periodType = 'MTD') {
  const params = useLevel();
  const [data, setData] = useState<GiroAcquisition | null>(null);
  const [status, setStatus] = useState<Status>('idle');

  useEffect(() => {
    if (!params) return;
    setStatus('loading');
    giroApi
      .getAcquisition({...params, periodType})
      .then(d => { setData(d); setStatus('success'); })
      .catch(() => setStatus('error'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params?.level, params?.levelId, periodType]);

  return {data, status, loading: status === 'loading'};
}
