import type { DuplicateGroup, OperationRecord } from '../../../types/operation'

export interface DeduplicateResult {
  unique: OperationRecord[]
  duplicates: DuplicateGroup[]
  discarded: number
}

/**
 * Conserva la primera aparición de cada ID_Operacion y descarta las siguientes.
 * Los registros sin identificador no se agrupan entre sí: cada uno se conserva.
 */
export function deduplicate(records: readonly OperationRecord[]): DeduplicateResult {
  const unique: OperationRecord[] = []
  const groups = new Map<string, DuplicateGroup>()
  const firstRowById = new Map<string, number>()

  for (const record of records) {
    if (record.id === null) {
      unique.push(record)
      continue
    }
    const keptRow = firstRowById.get(record.id)
    if (keptRow === undefined) {
      firstRowById.set(record.id, record.rowNumber)
      unique.push(record)
      continue
    }
    const group = groups.get(record.id) ?? { id: record.id, keptRow, discardedRows: [] }
    group.discardedRows.push(record.rowNumber)
    groups.set(record.id, group)
  }

  const duplicates = [...groups.values()]
  const discarded = duplicates.reduce((total, group) => total + group.discardedRows.length, 0)
  return { unique, duplicates, discarded }
}
