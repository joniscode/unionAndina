import type { DatasetSource, ImportOutcome } from '../../../types/operation'
import { hasAcceptedExtension, validateStructure } from '../validators/validateStructure'
import { deduplicate } from './deduplicate'
import { normalizeRecords } from './normalizeRecords'
import { readWorkbook, type RawSheet } from './readWorkbook'

/**
 * Pipeline completo y puro: lectura → estructura → normalización → duplicados.
 * No modifica el archivo original ni los datos activos; devuelve una vista previa.
 */
export function processWorkbook(data: ArrayBuffer, fileName: string, source: DatasetSource = 'upload'): ImportOutcome {
  if (!hasAcceptedExtension(fileName)) return { ok: false, error: { code: 'invalidExtension' } }

  let sheets: RawSheet[]
  try {
    sheets = readWorkbook(data)
  } catch {
    return { ok: false, error: { code: 'unreadable' } }
  }

  const structure = validateStructure(sheets)
  if (!structure.ok) {
    return {
      ok: false,
      error: { code: 'missingColumns', missingColumns: structure.missingColumns, sheetName: structure.sheetName },
    }
  }

  const { records, issues } = normalizeRecords(structure.sheet, structure.columnIndex)
  if (records.length === 0) {
    return { ok: false, error: { code: 'emptyFile', sheetName: structure.sheet.name } }
  }

  const { unique, duplicates, discarded } = deduplicate(records)
  return {
    ok: true,
    preview: {
      fileName,
      sheetName: structure.sheet.name,
      rowsRead: records.length,
      records: unique,
      duplicates,
      duplicatesDiscarded: discarded,
      issues,
      source,
    },
  }
}
