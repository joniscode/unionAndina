import { IMPORT_LIMITS } from '../../../config/dataContract'
import type { DataIssue, DatasetSource, ImportOutcome, ImportSummary, OperationRecord } from '../../../types/operation'
import { exceedsFileSize, hasAcceptedExtension, validateStructure } from '../validators/validateStructure'
import { deduplicate, type DeduplicateResult } from './deduplicate'
import { normalizeRecords } from './normalizeRecords'
import { readWorkbook, type RawWorkbook } from './readWorkbook'

export interface ProcessOptions {
  source?: DatasetSource
  maxRecords?: number
  maxFileBytes?: number
}

function summarize(rowsRead: number, dedup: DeduplicateResult, issues: DataIssue[], usable: number): ImportSummary {
  const rowsWithIssues = new Set(issues.map((issue) => issue.rowNumber))
  const rowsWithErrors = new Set(issues.filter((issue) => issue.severity === 'error').map((issue) => issue.rowNumber))
  const conflicts = dedup.duplicates.reduce((total, group) => total + group.conflictingRows.length, 0)
  const errors = issues.filter((issue) => issue.severity === 'error').length
  return {
    rowsRead,
    duplicatesDiscarded: dedup.discarded,
    uniqueRecords: dedup.unique.length,
    cleanRecords: dedup.unique.length - rowsWithIssues.size,
    recordsWithIssues: rowsWithIssues.size,
    excludedRecords: rowsWithErrors.size,
    usableRecords: usable,
    // Cada fila duplicada con contenido distinto cuenta como una advertencia adicional.
    warnings: issues.length - errors + conflicts,
    errors,
  }
}

/**
 * Pipeline completo y puro: límites → lectura → estructura → normalización → duplicados → resumen.
 * No modifica el archivo original ni los datos activos; devuelve una vista previa.
 */
export function processWorkbook(data: ArrayBuffer, fileName: string, options: ProcessOptions = {}): ImportOutcome {
  const { source = 'upload', maxRecords = IMPORT_LIMITS.maxRecords, maxFileBytes = IMPORT_LIMITS.maxFileBytes } = options
  if (!hasAcceptedExtension(fileName)) return { ok: false, error: { code: 'invalidExtension' } }
  if (exceedsFileSize(data.byteLength, maxFileBytes)) return { ok: false, error: { code: 'fileTooLarge' } }

  let workbook: RawWorkbook
  try {
    workbook = readWorkbook(data, { maxDataRows: maxRecords })
  } catch {
    return { ok: false, error: { code: 'unreadable' } }
  }

  const structure = validateStructure(workbook.sheets)
  if (!structure.ok) {
    return { ok: false, error: { code: 'missingColumns', missingColumns: structure.missingColumns, sheetName: structure.sheetName } }
  }
  const sheetName = structure.sheet.name
  // Nunca se trunca en silencio: si la hoja declara más filas que el límite, se rechaza.
  if (structure.sheet.declaredDataRows > maxRecords) return { ok: false, error: { code: 'tooManyRecords', sheetName } }

  const normalized = normalizeRecords(structure.sheet, structure.columnIndex, workbook.date1904)
  if (normalized.records.length === 0) return { ok: false, error: { code: 'emptyFile', sheetName } }

  const dedup = deduplicate(normalized.records)
  // Las incidencias de filas descartadas como duplicadas ya se informan como duplicados.
  const keptRows = new Set(dedup.unique.map((record) => record.rowNumber))
  const issues = normalized.issues.filter((issue) => keptRows.has(issue.rowNumber))
  const errorRows = new Set(issues.filter((issue) => issue.severity === 'error').map((issue) => issue.rowNumber))
  const records: OperationRecord[] = dedup.unique.filter((record) => !errorRows.has(record.rowNumber))
  if (records.length === 0) return { ok: false, error: { code: 'noUsableRecords', sheetName } }

  return {
    ok: true,
    preview: {
      fileName,
      sheetName,
      records,
      duplicates: dedup.duplicates,
      issues,
      summary: summarize(normalized.records.length, dedup, issues, records.length),
      source,
    },
  }
}
