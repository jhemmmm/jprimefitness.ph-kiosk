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
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const typography = {
  brand: {
    fontSize: 88,
    fontWeight: '900' as const,
    letterSpacing: -2,
  },
  hero: {
    fontSize: 56,
    fontWeight: '800' as const,
  },
  h1: {
    fontSize: 36,
    fontWeight: '800' as const,
  },
  h2: {
    fontSize: 28,
    fontWeight: '700' as const,
  },
  body: {
    fontSize: 18,
    fontWeight: '400' as const,
  },
  caption: {
    fontSize: 14,
    fontWeight: '400' as const,
  },
  caps: {
    fontSize: 16,
    fontWeight: '800' as const,
    letterSpacing: 2,
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
