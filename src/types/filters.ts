import type { OperationRecord } from './operation'

/** Campos de los registros que pueden filtrarse. */
export const FILTER_FIELDS = ['zone', 'client', 'serviceType', 'status'] as const satisfies readonly (keyof OperationRecord)[]

export type FilterField = (typeof FILTER_FIELDS)[number]

/** null = opción global ("todas"). */
export type Filters = Record<FilterField, string | null>

export type FilterOptions = Record<FilterField, string[]>
