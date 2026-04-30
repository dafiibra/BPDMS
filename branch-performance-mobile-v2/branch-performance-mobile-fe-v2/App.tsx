import React, {useEffect, useRef, useState} from 'react';
import {AppState, LogBox, Platform, StyleSheet, View} from 'react-native';
import RNScreenshotPrevent from 'react-native-screenshot-prevent';
import Svg, {Path} from 'react-native-svg';
import {AppNavigator} from './src/navigation/AppNavigator';
import {OnCallOverlay} from './src/components/common/OnCallOverlay';
import {VpnBlockOverlay} from './src/components/common/VpnBlockOverlay';
import {SecurityBottomSheet} from './src/components/common/SecurityBottomSheet';
import {useCallState} from './src/hooks/useCallState';
import {useVpnDetection} from './src/hooks/useVpnDetection';
import {useSecurityChecks} from './src/hooks/useSecurityChecks';

LogBox.ignoreLogs(['new NativeEventEmitter']);

const AccessibilityIcon = () => (
  <Svg width={38} height={38} viewBox="0 0 24 24" fill="#FFFFFF">
    <Path d="M12 2a2 2 0 1 1 0 4 2 2 0 0 1 0-4zm9 7h-6v13h-2v-6h-2v6H9V9H3V7h18v2z" />
  </Svg>
);

const DeveloperIcon = () => (
  <Svg width={38} height={38} viewBox="0 0 24 24" fill="#FFFFFF">
    <Path d="M9.4 16.6 4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0L19.2 12l-4.6-4.6L16 6l6 6-6 6-1.4-1.4z" />
  </Svg>
);

const DisplayIcon = () => (
  <Svg width={38} height={38} viewBox="0 0 24 24" fill="#FFFFFF">
    <Path d="M21 3H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h7v2H8v2h8v-2h-2v-2h7c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 14H3V5h18v12z" />
  </Svg>
);

export default function App() {
  const appStateRef = useRef(AppState.currentState);
  const [isBlurred, setIsBlurred] = useState(false);
  const {isOnCall} = useCallState();
  const {isVpnActive, isProxyActive} = useVpnDetection();
  const isVpnBlocked = isVpnActive || isProxyActive;
  const {
    isAccessibilityServiceEnabled,
    // isDeveloperModeActive,
    isMultipleDisplayActive,
  } = useSecurityChecks();

  useEffect(() => {
    if (Platform.OS === 'ios') {
      RNScreenshotPrevent.enabled(true);
    }
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'inactive' || nextAppState === 'background') {
        setIsBlurred(true);
      } else if (nextAppState === 'active') {
        setIsBlurred(false);
      }
      appStateRef.current = nextAppState;
    });

    return () => subscription.remove();
  }, []);

  return (
    <View style={styles.container}>
      <AppNavigator />
      {isBlurred && <View style={styles.overlay} />}
      {isOnCall && <OnCallOverlay />}
      {isVpnBlocked && <VpnBlockOverlay />}
      {isMultipleDisplayActive && (
        <SecurityBottomSheet
          icon={<DisplayIcon />}
          iconColor="#3182CE"
          title="Layar Tambahan Terdeteksi"
          subtitle={
            'Demi keamanan, aplikasi tidak dapat digunakan saat layar dibagi atau dicerminkan.\n\nPutuskan koneksi layar tambahan untuk melanjutkan.'
          }
        />
      )}
      {isAccessibilityServiceEnabled && (
        <SecurityBottomSheet
          icon={<AccessibilityIcon />}
          iconColor="#805AD5"
          title="Layanan Aksesibilitas Aktif"
          subtitle={
            'Aplikasi tidak dapat digunakan saat ada layanan aksesibilitas pihak ketiga yang aktif.\n\nNonaktifkan melalui Pengaturan untuk melanjutkan.'
          }
        />
      )}
      {/* {isDeveloperModeActive && (
        <SecurityBottomSheet
          icon={<DeveloperIcon />}
          iconColor="#E53E3E"
          title="Mode Pengembang Aktif"
          subtitle={
            'Demi keamanan data, aplikasi tidak dapat digunakan saat Mode Pengembang aktif.\n\nNonaktifkan melalui Pengaturan untuk melanjutkan.'
          }
        />
      )} */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0D1E2D',
    zIndex: 9999,
    elevation: 9999,
  },
});
