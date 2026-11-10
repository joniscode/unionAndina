import { APP_CONFIG } from '../config/app'
import { FILTER_FIELDS, type FilterField, type FilterOptions, type Filters } from '../types/filters'
import type { OperationRecord } from '../types/operation'

export const EMPTY_FILTERS: Filters = { zone: null, client: null, serviceType: null, status: null }

const collator = new Intl.Collator(APP_CONFIG.locale)

function distinctValues(records: readonly OperationRecord[], field: FilterField): string[] {
  const values = new Set<string>()
  for (const record of records) {
    const value = record[field]
    if (value !== null) values.add(value)
  }
  return [...values].sort(collator.compare)
}

/** Opciones generadas exclusivamente a partir de los registros activos. */
export function buildFilterOptions(records: readonly OperationRecord[]): FilterOptions {
  return {
    zone: distinctValues(records, 'zone'),
    client: distinctValues(records, 'client'),
    serviceType: distinctValues(records, 'serviceType'),
    status: distinctValues(records, 'status'),
  }
}

/** Aplica todos los filtros activos de forma combinada (AND). */
export function applyFilters(records: readonly OperationRecord[], filters: Filters): OperationRecord[] {
  const active = FILTER_FIELDS.filter((field) => filters[field] !== null)
  if (active.length === 0) return [...records]
  return records.filter((record) => active.every((field) => record[field] === filters[field]))
}

export function countActiveFilters(filters: Filters): number {
  return FILTER_FIELDS.filter((field) => filters[field] !== null).length
}

/** Búsqueda parcial por identificador, sin distinguir mayúsculas. */
export function searchById(records: readonly OperationRecord[], query: string): OperationRecord[] {
  const needle = query.trim().toLowerCase()
  if (needle === '') return [...records]
  return records.filter((record) => record.id?.toLowerCase().includes(needle) ?? false)
}
