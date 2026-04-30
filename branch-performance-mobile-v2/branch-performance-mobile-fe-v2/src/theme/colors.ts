// Colors extracted from Dashboard Kinerja Cabang SVG design
export const Colors = {
  // Background
  background: '#F5F6F7',
  surfaceDark: '#0D1E2D',
  surfaceDark2: '#1A2D3E',
  surfaceLight: '#FFFFFF',

  // Text
  textPrimary: '#121518',
  textSecondary: '#6A727D',
  textMuted: '#BFC2C8',
  textWhite: '#FFFFFF',

  // Status
  success: '#06AA6F',
  successLight: '#EBFAF5',
  successDark: '#09A854',

  warning: '#D19000',
  warningLight: '#FFF3CD',
  warningDark: '#9E6700',

  danger: '#D93535',
  dangerLight: '#FFF0F1',
  dangerDark: '#A31920',

  // Brand / Accent
  primary: '#0061AA',
  primaryLight: '#307FE2',
  accent: '#534AB7',

  // UI Elements
  border: '#DDE2E8',
  divider: '#DDE2E8',
  placeholder: '#BFC2C8',

  // Figma-aligned design tokens
  primary950: '#00223D',
  primary900: '#0F2D5A',
  primary800: '#00467E',
  primary600: '#0081E9',
  primary400: '#3FAAFF',
  primary200: '#95D0FF',
  primary50:  '#EBF6FF',

  yellow700:  '#BC8602',
  yellow50:   '#FFF9EB',

  red700:     '#D3000E',
  red50:      '#FFEBEC',

  green700:   '#2E7D32',
  green50:    '#F0FAF1',

  neutral950: '#121417',
  neutral900: '#2E333A',
  neutral800: '#404852',
  neutral500: '#7B8798',
  neutral200: '#C3C9D0',
  neutral50:  '#F4F5F6',
  neutralStroke: '#DCE0E4',
  cardBorder: '#EBECED',
};

export const StatusColors: Record<string, {bg: string; text: string; bar: string}> = {
  good: {
    bg: Colors.successLight,
    text: Colors.successDark,
    bar: Colors.success,
  },
  warning: {
    bg: Colors.warningLight,
    text: Colors.warningDark,
    bar: Colors.warning,
  },
  bad: {
    bg: Colors.dangerLight,
    text: Colors.dangerDark,
    bar: Colors.danger,
  },
};
