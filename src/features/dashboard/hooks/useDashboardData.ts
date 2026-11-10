import { useCallback, useMemo, useState } from 'react'
import { applyFilters, buildFilterOptions, countActiveFilters, EMPTY_FILTERS } from '../../../lib/filters'
import { computeKpis, countBy, groupFinancials } from '../../../lib/metrics'
import type { FilterField, Filters } from '../../../types/filters'
import type { OperationRecord } from '../../../types/operation'

/**
 * Estado de filtros + datos derivados. Indicadores, gráficos y tabla
 * consumen el mismo arreglo `filtered`, por lo que siempre son coherentes.
 */
export function useDashboardData(records: readonly OperationRecord[]) {
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS)

  const options = useMemo(() => buildFilterOptions(records), [records])
  const filtered = useMemo(() => applyFilters(records, filters), [records, filters])
  const kpis = useMemo(() => computeKpis(filtered), [filtered])
  const financialByZone = useMemo(() => groupFinancials(filtered, 'zone'), [filtered])
  const operationsByStatus = useMemo(() => countBy(filtered, 'status'), [filtered])

  const setFilter = useCallback((field: FilterField, value: string | null) => {
    setFilters((current) => ({ ...current, [field]: value }))
  }, [])
  const clearFilters = useCallback(() => setFilters(EMPTY_FILTERS), [])

  return {
    filters,
    options,
    filtered,
    kpis,
    financialByZone,
    operationsByStatus,
    activeFilters: countActiveFilters(filters),
    setFilter,
    clearFilters,
  }
}
