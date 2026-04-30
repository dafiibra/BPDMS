import React, {createContext, useContext, useEffect, useState} from 'react';
import {Alert} from 'react-native';
import {Env} from '../config/env';
import {orgApi} from '../api/orgApi';

export type OrgLevel = 'BRANCH' | 'AREA' | 'REGION';

interface LevelState {
  level: OrgLevel;
  levelId: string;
  snapshotDate?: string;
  periodCode?: string;
}

interface LevelContextValue extends LevelState {
  isReady: boolean;
  setLevelParams: (level: OrgLevel, levelId: string) => void;
}

const LevelContext = createContext<LevelContextValue>({
  level: 'REGION',
  levelId: '',
  isReady: false,
  setLevelParams: () => {},
});

export function LevelProvider({children}: {children: React.ReactNode}) {
  const [state, setState] = useState<LevelState>({level: 'REGION', levelId: ''});
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!Env.apiUrl) {
      Alert.alert('Config Error', 'API_URL kosong. Rebuild app dengan npm run android:dev');
      setIsReady(true);
      return;
    }
    orgApi
      .getRegions()
      .then(regions => {
        if (regions.length > 0) {
          setState(prev => ({...prev, level: 'REGION', levelId: regions[0].id}));
        }
      })
      .catch(err => {
        Alert.alert('API Error', `Gagal connect ke backend:\n${Env.apiUrl}\n\n${err?.message ?? err}`);
      })
      .finally(() => setIsReady(true));
  }, []);

  const setLevelParams = (level: OrgLevel, levelId: string) => {
    setState(prev => ({...prev, level, levelId}));
  };

  return (
    <LevelContext.Provider value={{...state, isReady, setLevelParams}}>
      {children}
    </LevelContext.Provider>
  );
}

export const useLevelContext = () => useContext(LevelContext);
