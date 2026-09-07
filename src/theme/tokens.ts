// Ported from the Addmin Claude Design system (tokens/colors.css, typography.css, spacing.css, elevation.css).
// Font family is Urbanist per project brief (design source used Inter; overridden here).

export const colors = {
  green50: '#eafbf2',
  green100: '#cdf3e0',
  green200: '#9de6c2',
  green300: '#65d19f',
  green400: '#34b87d',
  green500: '#1a8956',
  green600: '#136d44',
  green700: '#0f5636',
  green800: '#0b3f27',
  green900: '#07281a',

  slate0: '#ffffff',
  slate25: '#f7f8f8',
  slate50: '#eef0f1',
  slate100: '#dfe3e5',
  slate200: '#c3c9cd',
  slate300: '#a3abb1',
  slate400: '#7d868d',
  slate500: '#5c656c',
  slate600: '#454d53',
  slate700: '#30363b',
  slate800: '#1f2427',
  slate900: '#121517',
  slate950: '#080a0b',

  red500: '#c23b3b',
  red600: '#9c2f2f',
  red100: '#f8dede',
  amber500: '#b9791a',
  amber600: '#946213',
  amber100: '#f6e6cb',
  sky500: '#2b7bb8',
  sky600: '#215f8f',
  sky100: '#dbeaf5',
  greenStatus500: '#2e8b5b',
  greenStatus600: '#236b46',
  greenStatus100: '#d9f0e2',
} as const;

export const theme = {
  bgPage: colors.slate25,
  bgRaised: colors.slate0,
  bgSunken: colors.slate50,
  bgOverlay: 'rgba(8,10,11,0.48)',

  borderSubtle: colors.slate100,
  borderDefault: colors.slate200,
  borderStrong: colors.slate300,

  textPrimary: colors.slate900,
  textSecondary: colors.slate500,
  textTertiary: colors.slate400,
  textDisabled: colors.slate300,
  textInverse: colors.slate0,

  brandDefault: colors.green500,
  brandHover: colors.green600,
  brandActive: colors.green700,
  brandSubtle: colors.green50,
  brandBorder: colors.green200,
  textOnBrand: colors.slate0,

  statusSuccess: colors.greenStatus500,
  statusSuccessBg: colors.greenStatus100,
  statusSuccessStrong: colors.greenStatus600,
  statusWarning: colors.amber500,
  statusWarningBg: colors.amber100,
  statusWarningStrong: colors.amber600,
  statusDanger: colors.red500,
  statusDangerBg: colors.red100,
  statusDangerStrong: colors.red600,
  statusInfo: colors.sky500,
  statusInfoBg: colors.sky100,
  statusInfoStrong: colors.sky600,

  focusRing: colors.sky500,
} as const;

export const font = {
  family: 'Urbanist_400Regular',
  familyMedium: 'Urbanist_500Medium',
  familySemiBold: 'Urbanist_600SemiBold',
  familyBold: 'Urbanist_700Bold',
} as const;

export const type = {
  display: { fontSize: 36, lineHeight: 42, fontFamily: font.familySemiBold },
  h1: { fontSize: 28, lineHeight: 34, fontFamily: font.familySemiBold },
  h2: { fontSize: 22, lineHeight: 28, fontFamily: font.familySemiBold },
  h3: { fontSize: 18, lineHeight: 24, fontFamily: font.familySemiBold },
  body: { fontSize: 15, lineHeight: 22, fontFamily: font.family },
  small: { fontSize: 13, lineHeight: 18, fontFamily: font.family },
  caption: { fontSize: 12, lineHeight: 16, fontFamily: font.familyMedium },
  label: { fontSize: 13, lineHeight: 16, fontFamily: font.familySemiBold, letterSpacing: 0.26 },
} as const;

export const space = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
} as const;

export const radius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 999,
} as const;

export const shadow = {
  1: { shadowColor: '#080a0b', shadowOpacity: 0.06, shadowRadius: 2, shadowOffset: { width: 0, height: 1 }, elevation: 1 },
  2: { shadowColor: '#080a0b', shadowOpacity: 0.08, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  3: { shadowColor: '#080a0b', shadowOpacity: 0.1, shadowRadius: 16, shadowOffset: { width: 0, height: 6 }, elevation: 4 },
  4: { shadowColor: '#080a0b', shadowOpacity: 0.14, shadowRadius: 32, shadowOffset: { width: 0, height: 12 }, elevation: 8 },
} as const;
