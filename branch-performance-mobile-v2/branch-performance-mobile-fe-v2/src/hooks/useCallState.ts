import {useEffect, useState} from 'react';
import {NativeEventEmitter, NativeModules, PermissionsAndroid, Platform} from 'react-native';

type CallState = 'IDLE' | 'RINGING' | 'OFFHOOK';

const {CallStateModule} = NativeModules;

export const useCallState = () => {
  const [callState, setCallState] = useState<CallState>('IDLE');

  useEffect(() => {
    if (!CallStateModule) return;

    const start = async () => {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE,
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) return;
      }
      CallStateModule.startListening();
    };

    const emitter = new NativeEventEmitter(CallStateModule);
    const subscription = emitter.addListener('CallStateChanged', (state: CallState) => {
      setCallState(state);
    });

    start();

    return () => {
      subscription.remove();
      CallStateModule.stopListening();
    };
  }, []);

  return {isOnCall: callState === 'OFFHOOK'};
};
