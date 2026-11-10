import { APP_CONFIG } from '../config/app'

const currency = new Intl.NumberFormat(APP_CONFIG.locale, {
  style: 'currency',
  currency: APP_CONFIG.currency,
  maximumFractionDigits: 0,
})

const compactCurrency = new Intl.NumberFormat(APP_CONFIG.locale, {
  style: 'currency',
  currency: APP_CONFIG.currency,
  notation: 'compact',
  maximumFractionDigits: 1,
})

const integer = new Intl.NumberFormat(APP_CONFIG.locale, { maximumFractionDigits: 0 })
const percent = new Intl.NumberFormat(APP_CONFIG.locale, { style: 'percent', maximumFractionDigits: 1 })
const date = new Intl.DateTimeFormat(APP_CONFIG.locale, { year: 'numeric', month: '2-digit', day: '2-digit' })

export const formatCurrency = (value: number): string => currency.format(value)
export const formatCompactCurrency = (value: number): string => compactCurrency.format(value)
export const formatInteger = (value: number): string => integer.format(value)
/** Recibe un porcentaje en escala 0–100. */
export const formatPercent = (value: number): string => percent.format(value / 100)
export const formatDate = (value: Date): string => date.format(value)
