import {useEffect, useState} from 'react';
import {NativeEventEmitter, NativeModules} from 'react-native';

type VpnState = {
  isVpnActive: boolean;
  isProxyActive: boolean;
};

const {VpnDetectorModule} = NativeModules;

export const useVpnDetection = () => {
  const [state, setState] = useState<VpnState>({
    isVpnActive: false,
    isProxyActive: false,
  });

  useEffect(() => {
    if (!VpnDetectorModule) return;

    const emitter = new NativeEventEmitter(VpnDetectorModule);
    const subscription = emitter.addListener('VpnStateChanged', (next: VpnState) => {
      setState(next);
    });

    VpnDetectorModule.startListening();

    VpnDetectorModule.checkIsProxyActive()
      .then((isProxyActive: boolean) =>
        setState(prev => ({...prev, isProxyActive})),
      )
      .catch(() => {});

    return () => {
      subscription.remove();
      VpnDetectorModule.stopListening();
    };
  }, []);

  return state;
};
