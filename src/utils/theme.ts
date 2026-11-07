import { AppearanceSettings, ThemeMode, AccentPalette } from '../types';

export function hexToRgb(hex: string): string | null {
  const cleanHex = hex.replace('#', '');
  if (cleanHex.length === 3) {
    const r = parseInt(cleanHex[0] + cleanHex[0], 16);
    const g = parseInt(cleanHex[1] + cleanHex[1], 16);
    const b = parseInt(cleanHex[2] + cleanHex[2], 16);
    return `${r} ${g} ${b}`;
  } else if (cleanHex.length === 6) {
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    return `${r} ${g} ${b}`;
  }
  return null;
}

export const PALETTE_COLORS: Record<AccentPalette, { light: string; dark: string; name: string }> = {
  violet: { light: '124 58 237', dark: '167 139 250', name: 'Violet / Purple' },
  cyan: { light: '8 145 178', dark: '0 240 255', name: 'Blue / Cyan' },
  emerald: { light: '16 185 129', dark: '52 211 153', name: 'Emerald / Green' },
  rose: { light: '225 29 72', dark: '251 113 133', name: 'Rose / Pink' },
  amber: { light: '217 119 6', dark: '251 191 36', name: 'Amber / Orange' },
  custom: { light: '124 58 237', dark: '167 139 250', name: 'Custom Accent' },
};

export function applyTheme(appearance: AppearanceSettings) {
  const root = document.documentElement;

  // 1. Resolve light vs dark
  let isDark = true;
  if (appearance.themeMode === 'light') {
    isDark = false;
  } else if (appearance.themeMode === 'system') {
    isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  root.setAttribute('data-theme', isDark ? 'dark' : 'light');

  // 2. Set accent color
  if (appearance.accentPalette === 'custom' && appearance.primaryAccent) {
    const rgb = hexToRgb(appearance.primaryAccent);
    if (rgb) {
      root.style.setProperty('--c-accent', rgb);
    }
  } else {
    const pal = PALETTE_COLORS[appearance.accentPalette] || PALETTE_COLORS.violet;
    root.style.setProperty('--c-accent', isDark ? pal.dark : pal.light);
  }

  // 3. Secondary accent
  if (appearance.secondaryAccent) {
    const secRgb = hexToRgb(appearance.secondaryAccent);
    if (secRgb) {
      root.style.setProperty('--c-accent-secondary', secRgb);
    }
  }

  // 4. Custom overrides if provided
  if (appearance.customBg) {
    const bgRgb = hexToRgb(appearance.customBg);
    if (bgRgb) root.style.setProperty('--c-bg', bgRgb);
  } else {
    root.style.removeProperty('--c-bg');
  }

  if (appearance.customSurface) {
    const surfRgb = hexToRgb(appearance.customSurface);
    if (surfRgb) root.style.setProperty('--c-surface', surfRgb);
  } else {
    root.style.removeProperty('--c-surface');
  }

  if (appearance.customText) {
    const textRgb = hexToRgb(appearance.customText);
    if (textRgb) root.style.setProperty('--c-ink', textRgb);
  } else {
    root.style.removeProperty('--c-ink');
  }

  // 5. Component Styling
  if (appearance.componentStyling === 'subtle') {
    root.style.setProperty('--radius-component', '8px');
    root.style.setProperty('--radius-card', '12px');
  } else {
    root.style.setProperty('--radius-component', '14px');
    root.style.setProperty('--radius-card', '18px');
  }
}
