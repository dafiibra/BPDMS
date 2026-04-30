import React, {useCallback, useState} from 'react';
import {NativeModules, Platform} from 'react-native';
import {NavigationContainer, useNavigationContainerRef} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {DpkScreen} from '../dpk/DpkScreen';
import {LoginScreen} from '../screens/Login';
import {SECURE_SCREENS} from '../config/secureScreens';

export type RootStackParamList = {
  Login: undefined;
  Main: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export function AppNavigator() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [nip, setNip] = useState('');
  const navigationRef = useNavigationContainerRef<RootStackParamList>();

  const applySecureFlag = useCallback(() => {
    if (__DEV__) return;
    if (Platform.OS !== 'android') return;
    const routeName = navigationRef.getCurrentRoute()?.name;
    if (!routeName) return;
    const shouldSecure = SECURE_SCREENS.includes(routeName as keyof RootStackParamList);
    if (shouldSecure) {
      NativeModules.SecureScreenModule?.enable();
    } else {
      NativeModules.SecureScreenModule?.disable();
    }
  }, [navigationRef]);

  return (
    <NavigationContainer
      ref={navigationRef}
      onReady={applySecureFlag}
      onStateChange={applySecureFlag}>
      <Stack.Navigator screenOptions={{headerShown: false, animationEnabled: true}}>
        {isLoggedIn ? (
          <Stack.Screen name="Main">
            {() => <DpkScreen nip={nip} />}
          </Stack.Screen>
        ) : (
          <Stack.Screen name="Login">
            {() => <LoginScreen onLogin={n => { setNip(n); setIsLoggedIn(true); }} />}
          </Stack.Screen>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
