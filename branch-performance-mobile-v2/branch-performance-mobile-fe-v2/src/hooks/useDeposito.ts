import {useEffect, useRef, useState} from 'react';
import {
  depositoApi,
  DepositoSummary, DepositoGrowth, DepositoComposition, DepositoCurrency,
  LevelParams,
} from '../api/depositoApi';
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

export function useDepositoSummary() {
  return useFetch<DepositoSummary>(p => depositoApi.getSummary(p));
}

export function useDepositoGrowth() {
  return useFetch<DepositoGrowth>(p => depositoApi.getGrowth(p));
}

export function useDepositoComposition() {
  return useFetch<DepositoComposition>(p => depositoApi.getComposition(p));
}

export function useDepositoCurrency() {
  return useFetch<DepositoCurrency>(p => depositoApi.getCurrency(p));
}
