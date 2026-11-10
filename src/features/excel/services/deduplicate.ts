import type { DuplicateGroup, OperationRecord } from '../../../types/operation'

export interface DeduplicateResult {
  unique: OperationRecord[]
  duplicates: DuplicateGroup[]
  discarded: number
}

/** Compara el contenido de dos registros sin tener en cuenta la fila de origen. */
export function sameContent(a: OperationRecord, b: OperationRecord): boolean {
  const keys = Object.keys(a) as (keyof OperationRecord)[]
  return keys.every((key) => key === 'rowNumber' || a[key] === b[key])
}

/**
 * Conserva la primera aparición de cada ID_Operacion y descarta las siguientes
 * (el contrato define el ID como identificador único de la operación).
 * Si una aparición posterior tiene contenido distinto, se reporta como conflicto.
 * Los registros sin identificador no se agrupan entre sí.
 */
export function deduplicate(records: readonly OperationRecord[]): DeduplicateResult {
  const unique: OperationRecord[] = []
  const firstById = new Map<string, OperationRecord>()
  const groups = new Map<string, DuplicateGroup>()

  for (const record of records) {
    if (record.id === null) {
      unique.push(record)
      continue
    }
    const first = firstById.get(record.id)
    if (!first) {
      firstById.set(record.id, record)
      unique.push(record)
      continue
    }
    const group = groups.get(record.id) ?? { id: record.id, keptRow: first.rowNumber, discardedRows: [], conflictingRows: [] }
    group.discardedRows.push(record.rowNumber)
    if (!sameContent(first, record)) group.conflictingRows.push(record.rowNumber)
    groups.set(record.id, group)
  }

  const duplicates = [...groups.values()]
  const discarded = duplicates.reduce((total, group) => total + group.discardedRows.length, 0)
  return { unique, duplicates, discarded }
}
