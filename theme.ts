export const colors = {
  ink: '#0A0A0A',
  inkSoft: '#1A1A1A',
  crimson: '#B91C1C',
  crimsonDark: '#7F1717',
  surface: '#F1F1F1',
  surfaceMuted: '#E7E7E7',
  border: '#D9D9D9',
  white: '#FFFFFF',
  success: '#16A34A',
  danger: '#DC2626',
  textMuted: '#6B7280',
};

export const radius = {
  sm: 8,
  md: 16,
  lg: 24,
  pill: 999,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 18,
  xl: 24,
  xxl: 32,
};

export const fonts = {
  oswald: 'Oswald_400Regular',
  oswaldBold: 'Oswald_700Bold',
};

export const typography = {
  brand: {
    fontFamily: fonts.oswaldBold,
    fontSize: 48,
    letterSpacing: 2,
  },
  hero: {
    fontSize: 40,
    fontWeight: '800' as const,
  },
  h1: {
    fontSize: 26,
    fontWeight: '800' as const,
  },
  h2: {
    fontSize: 20,
    fontWeight: '700' as const,
  },
  body: {
    fontSize: 15,
    fontWeight: '400' as const,
  },
  caption: {
    fontSize: 13,
    fontWeight: '400' as const,
  },
  caps: {
    fontSize: 14,
    fontWeight: '800' as const,
    letterSpacing: 1.5,
    textTransform: 'uppercase' as const,
  },
};

export const shadow = {
  card: {
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  text: {
    textShadowColor: 'rgba(0,0,0,0.18)',
    textShadowOffset: { width: 4, height: 4 },
    textShadowRadius: 0,
  },
};
