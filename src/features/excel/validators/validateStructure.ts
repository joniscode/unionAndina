import { ACCEPTED_EXTENSIONS, COLUMNS, IMPORT_LIMITS, REQUIRED_COLUMNS, type ColumnKey } from '../../../config/dataContract'
import { formatDecimal, formatInteger } from '../../../lib/format'
import { parseText } from '../../../lib/parse'
import type { RawSheet } from '../services/readWorkbook'

const BYTES_PER_MB = 1024 * 1024

export type ColumnIndex = Record<ColumnKey, number>

export type StructureResult =
  | { ok: true; sheet: RawSheet; columnIndex: ColumnIndex }
  | { ok: false; missingColumns: string[]; sheetName?: string }

export function hasAcceptedExtension(fileName: string): boolean {
  const lower = fileName.toLowerCase()
  return ACCEPTED_EXTENSIONS.some((extension) => lower.endsWith(extension))
}

/** Parámetros de texto para mostrar los límites de importación. */
export function importLimitParams(): { maxMb: string; maxRecords: string } {
  return {
    maxMb: formatDecimal(IMPORT_LIMITS.maxFileBytes / BYTES_PER_MB),
    maxRecords: formatInteger(IMPORT_LIMITS.maxRecords),
  }
}

/** Se comprueba antes de leer el archivo para no cargar en memoria archivos excesivos. */
export function exceedsFileSize(bytes: number, maxBytes: number = IMPORT_LIMITS.maxFileBytes): boolean {
  return bytes > maxBytes
}

function readHeaders(sheet: RawSheet): (string | null)[] {
  return (sheet.rows[0] ?? []).map(parseText)
}

function missingColumns(headers: readonly (string | null)[]): string[] {
  return REQUIRED_COLUMNS.filter((column) => !headers.includes(column))
}

function buildColumnIndex(headers: readonly (string | null)[]): ColumnIndex {
  const entries = (Object.keys(COLUMNS) as ColumnKey[]).map((key) => [key, headers.indexOf(COLUMNS[key])] as const)
  return Object.fromEntries(entries) as ColumnIndex
}

/**
 * Busca la hoja de datos operativos: la primera que contiene todas las columnas obligatorias.
 * Las hojas auxiliares (diccionario, instrucciones) no las contienen y se ignoran.
 * Si ninguna cumple, informa las columnas faltantes de la hoja más parecida.
 */
export function validateStructure(sheets: readonly RawSheet[]): StructureResult {
  let best: { sheet: RawSheet; missing: string[] } | null = null
  for (const sheet of sheets) {
    const headers = readHeaders(sheet)
    const missing = missingColumns(headers)
    if (missing.length === 0) return { ok: true, sheet, columnIndex: buildColumnIndex(headers) }
    if (!best || missing.length < best.missing.length) best = { sheet, missing }
  }
  if (!best) return { ok: false, missingColumns: [...REQUIRED_COLUMNS] }
  return { ok: false, missingColumns: best.missing, sheetName: best.sheet.name }
}
