import type {RootStackParamList} from '../navigation/AppNavigator';

// List of screens where screenshots and screen recording are blocked (Android only).
// Add a screen name here to automatically enable FLAG_SECURE when that screen is active.
export const SECURE_SCREENS: ReadonlyArray<keyof RootStackParamList> = [
  'Login',
];
