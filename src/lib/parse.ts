import { SLA_VALUES } from '../config/dataContract'

export interface ParseResult<T> {
  value: T | null
  /** true cuando la celda tiene contenido pero no es un valor válido. */
  invalid: boolean
}

const PLAIN_NUMBER = /^-?\d+(\.\d+)?$/
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
  return String(value).trim()
}

/**
 * Acepta números de Excel o texto numérico plano ("1500", "-20.5").
 * Todo resultado se valida con Number.isFinite: NaN o Infinity se marcan como inválidos.
 * Un valor inválido nunca se convierte en cero.
 */
export function parseNumber(value: unknown): ParseResult<number> {
  if (isBlank(value)) return EMPTY
  let candidate: number | null = null
  if (typeof value === 'number') candidate = value
  else if (typeof value === 'string' && PLAIN_NUMBER.test(value.trim())) candidate = Number(value.trim())
  return candidate !== null && Number.isFinite(candidate) ? { value: candidate, invalid: false } : { value: null, invalid: true }
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
