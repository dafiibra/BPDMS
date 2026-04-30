import {useCallback, useEffect, useState} from 'react';
import {AppState, NativeModules} from 'react-native';

type SecurityChecks = {
  isAccessibilityServiceEnabled: boolean;
  isDeveloperModeActive: boolean;
  isMultipleDisplayActive: boolean;
  isKeyboardNotAllowed: boolean;
};

const {SecurityChecksModule} = NativeModules;

const INITIAL: SecurityChecks = {
  isAccessibilityServiceEnabled: false,
  isDeveloperModeActive: false,
  isMultipleDisplayActive: false,
  isKeyboardNotAllowed: false,
};

export const useSecurityChecks = () => {
  const [checks, setChecks] = useState<SecurityChecks>(INITIAL);

  const refresh = useCallback(async () => {
    if (!SecurityChecksModule) return;
    const [a11y, dev, display, keyboard] = await Promise.all([
      SecurityChecksModule.isAccessibilityServiceEnabled(),
      SecurityChecksModule.isDeveloperModeActive(),
      SecurityChecksModule.isMultipleDisplayActive(),
      SecurityChecksModule.isKeyboardNotAllowed(),
    ]);
    setChecks({
      isAccessibilityServiceEnabled: a11y,
      isDeveloperModeActive: dev,
      isMultipleDisplayActive: display,
      isKeyboardNotAllowed: keyboard,
    });
  }, []);

  useEffect(() => {
    refresh();
    const sub = AppState.addEventListener('change', state => {
      if (state === 'active') refresh();
    });
    return () => sub.remove();
  }, [refresh]);

  return {
    ...checks,
    refresh,
    openDeveloperSettings: () => SecurityChecksModule?.openDeveloperSettings(),
    openAccessibilitySettings: () => SecurityChecksModule?.openAccessibilitySettings(),
  };
};
