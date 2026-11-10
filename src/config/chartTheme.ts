import type { Tone } from './statusTones'

/** Colores de gráficos tomados de las variables CSS centralizadas (styles/globals.css). */
export const CHART_COLORS = {
  income: 'var(--color-chart-income)',
  cost: 'var(--color-chart-cost)',
  margin: 'var(--color-chart-margin)',
  grid: 'var(--color-chart-grid)',
  axis: 'var(--color-ink-subtle)',
  zeroLine: 'var(--color-ink-subtle)',
} as const

export const TONE_COLORS: Record<Tone, string> = {
  success: 'var(--color-success)',
  warning: 'var(--color-brand-orange)',
  danger: 'var(--color-danger)',
  info: 'var(--color-info)',
  neutral: 'var(--color-neutral)',
}

export const CHART_LAYOUT = {
  barSize: 10,
  rowHeight: 64,
  statusRowHeight: 48,
  minHeight: 220,
  categoryWidth: 116,
} as const
