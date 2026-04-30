import {Platform} from 'react-native';

export const colors = {
  primary: '#12335E',
  primaryContainer: '#1a4a7a',
  primaryLight: '#e8f0fe',

  secondary: '#006a6a',
  secondaryContainer: '#b2dfdb',

  surface: '#F9F9FC',
  surfaceContainerLow: '#f3f3f6',
  surfaceContainerLowest: '#ffffff',
  surfaceContainer: '#ecedf0',
  surfaceContainerHigh: '#EBEBEB',
  surfaceContainerHighest: '#e0e1e4',
  surfaceBright: '#f0f4ff',

  onSurface: '#43474F',
  onSurfaceVariant: '#545960',

  tertiaryContainer: '#d4f5e2',
  onTertiaryContainer: '#0a5c2b',

  error: '#ba1a1a',
  errorContainer: '#ffdad6',
  onErrorContainer: '#6b1212',

  green: '#0a8554',
  greenLight: '#d4f5e2',
  greenDark: '#0a5c2b',

  amber: '#b47800',
  amberLight: '#fef3d7',
  amberDark: '#6b4400',

  red: '#ba1a1a',
  redLight: '#ffdad6',
  redDark: '#6b1212',

  heroBg: '#12335E',

  white: '#ffffff',
  black: '#000000',
  transparent: 'transparent',
};

export const radii = {
  card: 16,
  pill: 99,
  btn: 12,
};

export const fontSizes = {
  xs: 10,
  sm: 11,
  base: 13,
  lg: 15,
  xl: 22,
  xxl: 28,
};

export const fonts = {
  inter: Platform.select({ios: 'Inter', android: 'Inter'}),
  manrope: Platform.select({ios: 'Manrope', android: 'Manrope'}),
};

export const shadows = {
  card: {
    shadowColor: '#12335E',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 3,
  },
  hero: {
    shadowColor: '#12335E',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.18,
    shadowRadius: 28,
    elevation: 6,
  },
  ambient: {
    shadowColor: '#12335E',
    shadowOffset: {width: 0, height: 12},
    shadowOpacity: 0.06,
    shadowRadius: 32,
    elevation: 4,
  },
  tabsShadow: {
    shadowColor: 'rgba(0,52,97,1)',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 4,
  },
  bottomNav: {
    shadowColor: 'rgba(0,52,97,1)',
    shadowOffset: {width: 0, height: -4},
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 8,
  },
};
