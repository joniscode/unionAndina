/**
 * Fechas de calendario sin zona horaria.
 * Se normalizan como texto ISO "AAAA-MM-DD" (ordenable y libre de desplazamientos
 * por zona horaria) y se muestran como "DD/MM/AAAA".
 */
import { isBlank, type ParseResult } from './parse'

const MS_PER_DAY = 86_400_000
const MIN_YEAR = 1900
const MAX_YEAR = 9999
/** Serie 60 del sistema 1900 = 29/02/1900, fecha inexistente heredada de Lotus 1-2-3. */
const LOTUS_PHANTOM_DAY = 60
/** Última serie válida en Excel (31/12/9999, sistema 1900). */
const MAX_SERIAL = 2_958_465

const ISO_TEXT = /^(\d{4})-(\d{1,2})-(\d{1,2})$/
const DMY_TEXT = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/

export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
}

export function daysInMonth(year: number, month: number): number {
  if (month === 2) return isLeapYear(year) ? 29 : 28
  return [4, 6, 9, 11].includes(month) ? 30 : 31
}

export function isValidCalendarDate(year: number, month: number, day: number): boolean {
  return (
    Number.isInteger(year) &&
    Number.isInteger(month) &&
    Number.isInteger(day) &&
    year >= MIN_YEAR &&
    year <= MAX_YEAR &&
    month >= 1 &&
    month <= 12 &&
    day >= 1 &&
    day <= daysInMonth(year, month)
  )
}

const pad = (value: number, length = 2): string => String(value).padStart(length, '0')

export function toIsoDate(year: number, month: number, day: number): string | null {
  return isValidCalendarDate(year, month, day) ? `${pad(year, 4)}-${pad(month)}-${pad(day)}` : null
}

function fromUtcMs(ms: number): string | null {
  const date = new Date(ms)
  return toIsoDate(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate())
}

/**
 * Convierte un número de serie de Excel en fecha ISO respetando el sistema del libro.
 * Se ignora la fracción horaria. Toda la aritmética se hace en UTC.
 */
export function excelSerialToIso(serial: number, date1904 = false): string | null {
  if (!Number.isFinite(serial)) return null
  const days = Math.floor(serial)
  if (date1904) {
    if (days < 0 || days > MAX_SERIAL - 1462) return null
    return fromUtcMs(Date.UTC(1904, 0, 1) + days * MS_PER_DAY)
  }
  if (days < 1 || days > MAX_SERIAL || days === LOTUS_PHANTOM_DAY) return null
  // Hasta el 28/02/1900 la serie cuenta desde 31/12/1899; después, el día ficticio desplaza un día.
  const base = days < LOTUS_PHANTOM_DAY ? Date.UTC(1899, 11, 31) : Date.UTC(1899, 11, 30)
  return fromUtcMs(base + days * MS_PER_DAY)
}

function parseDateText(text: string): string | null {
  const iso = ISO_TEXT.exec(text)
  if (iso) return toIsoDate(Number(iso[1]), Number(iso[2]), Number(iso[3]))
  const dmy = DMY_TEXT.exec(text)
  if (dmy) return toIsoDate(Number(dmy[3]), Number(dmy[2]), Number(dmy[1]))
  return null
}

/**
 * Acepta: número de serie de Excel, texto "AAAA-MM-DD" o "DD/MM/AAAA".
 * Las fechas imposibles (p. ej. 31/02) se marcan como inválidas, nunca se desplazan.
 */
export function parseDateValue(value: unknown, date1904 = false): ParseResult<string> {
  if (isBlank(value)) return { value: null, invalid: false }
  let iso: string | null = null
  if (typeof value === 'number') iso = excelSerialToIso(value, date1904)
  else if (typeof value === 'string') iso = parseDateText(value.trim())
  return iso === null ? { value: null, invalid: true } : { value: iso, invalid: false }
}

/** "AAAA-MM-DD" → "DD/MM/AAAA" sin pasar por objetos Date. */
export function formatIsoDate(iso: string): string {
  const [year, month, day] = iso.split('-')
  return `${day}/${month}/${year}`
}
