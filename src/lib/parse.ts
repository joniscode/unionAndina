import { SLA_VALUES } from '../config/dataContract'

export interface ParseResult<T> {
  value: T | null
  /** true cuando la celda tiene contenido pero no es un valor válido. */
  invalid: boolean
}

const PLAIN_NUMBER = /^-?\d+(\.\d+)?$/
const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/
const EMPTY: ParseResult<never> = { value: null, invalid: false }

/** Minúsculas, sin tildes ni espacios redundantes. */
export function normalizeKey(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase()
}

export function isBlank(value: unknown): boolean {
  return value === null || value === undefined || (typeof value === 'string' && value.trim() === '')
}

export function parseText(value: unknown): string | null {
  if (isBlank(value)) return null
  if (value instanceof Date) return value.toISOString()
  return String(value).trim()
}

/**
 * Acepta números de Excel o texto numérico plano ("1500", "-20.5").
 * Cualquier otro contenido se marca como inválido: nunca se convierte en cero.
 */
export function parseNumber(value: unknown): ParseResult<number> {
  if (isBlank(value)) return EMPTY
  if (typeof value === 'number') {
    return Number.isFinite(value) ? { value, invalid: false } : { value: null, invalid: true }
  }
  if (typeof value === 'string' && PLAIN_NUMBER.test(value.trim())) {
    return { value: Number(value.trim()), invalid: false }
  }
  return { value: null, invalid: true }
}

export function parseDate(value: unknown): ParseResult<Date> {
  if (isBlank(value)) return EMPTY
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? { value: null, invalid: true } : { value, invalid: false }
  }
  if (typeof value === 'string') {
    const match = ISO_DATE.exec(value.trim())
    if (match) {
      const [year, month, day] = match.slice(1).map(Number)
      if (year !== undefined && month !== undefined && day !== undefined) {
        return { value: new Date(year, month - 1, day), invalid: false }
      }
    }
  }
  return { value: null, invalid: true }
}

export interface SlaResult {
  value: boolean | null
  raw: string | null
  unknown: boolean
}

export function parseSla(value: unknown): SlaResult {
  const raw = parseText(value)
  if (raw === null) return { value: null, raw: null, unknown: false }
  const key = normalizeKey(raw)
  if ((SLA_VALUES.met as readonly string[]).includes(key)) return { value: true, raw, unknown: false }
  if ((SLA_VALUES.notMet as readonly string[]).includes(key)) return { value: false, raw, unknown: false }
  return { value: null, raw, unknown: true }
}
