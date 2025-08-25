// src/theme.ts
export const colors = {
  primary: '#1E4DD8',   // azul header
  primaryDark: '#0B3BBE',
  accent: '#EB6F3A',    // naranja CTA
  bg: '#ffffff',
  text: '#0F172A',
  muted: '#64748B',     // 👈 aquí es muted
  success: '#22C55E',
  chip: '#EAEFFC',
  greenChip: '#D9F99D',
  border: '#E5E7EB',
};

export const spacing = (n = 1) => 8 * n;

export const fonts = {
  h1: { fontSize: 24, fontWeight: '700', color: colors.text },
  h2: { fontSize: 18, fontWeight: '700', color: colors.text },
  h3: { fontSize: 16, fontWeight: '600', color: colors.text },

  p: { fontSize: 14, color: colors.muted },
  small: { fontSize: 12, color: colors.muted }, // 👈 corregido
};

export const radius = {
  sm: 8, md: 14, lg: 20, xl: 28,
};
