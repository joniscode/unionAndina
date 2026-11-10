import type { OperationRecord } from '../types/operation'

export interface FinancialTotals {
  income: number
  cost: number
  /** Ingresos − Costos de los registros con ambos importes válidos. */
  margin: number
  /** Margen / Ingresos × 100; null si los ingresos no son > 0. */
  marginPct: number | null
  /** Registros que entran en los cálculos financieros. */
  records: number
}

export interface SlaSummary {
  met: number
  evaluated: number
  /** met / evaluated × 100; null si no hay registros evaluables. */
  pct: number | null
}

export interface Kpis {
  totalOperations: number
  financial: FinancialTotals
  /** Registros sin ingreso o costo válido (excluidos de los importes). */
  excludedFromFinancials: number
  sla: SlaSummary
}

export function ratioPercent(numerator: number, denominator: number): number | null {
  return denominator > 0 ? (numerator / denominator) * 100 : null
}

function hasFinancials(record: OperationRecord): record is OperationRecord & { income: number; cost: number } {
  return record.income !== null && record.cost !== null
}

export function sumFinancials(records: readonly OperationRecord[]): FinancialTotals {
  let income = 0
  let cost = 0
  let count = 0
  for (const record of records) {
    if (!hasFinancials(record)) continue
    income += record.income
    cost += record.cost
    count += 1
  }
  const margin = income - cost
  return { income, cost, margin, marginPct: ratioPercent(margin, income), records: count }
}

export function summarizeSla(records: readonly OperationRecord[]): SlaSummary {
  const evaluated = records.filter((record) => record.slaMet !== null)
  const met = evaluated.filter((record) => record.slaMet === true).length
  return { met, evaluated: evaluated.length, pct: ratioPercent(met, evaluated.length) }
}

export function computeKpis(records: readonly OperationRecord[]): Kpis {
  const financial = sumFinancials(records)
  return {
    totalOperations: records.length,
    financial,
    excludedFromFinancials: records.length - financial.records,
    sla: summarizeSla(records),
  }
}

type GroupField = 'zone' | 'client' | 'serviceType' | 'status'

function groupBy(records: readonly OperationRecord[], field: GroupField): Map<string | null, OperationRecord[]> {
  const groups = new Map<string | null, OperationRecord[]>()
  for (const record of records) {
    const key = record[field]
    const bucket = groups.get(key)
    if (bucket) bucket.push(record)
    else groups.set(key, [record])
  }
  return groups
}

export interface FinancialGroup extends FinancialTotals {
  key: string | null
}

/** Totales financieros por categoría, ordenados por ingresos descendentes. */
export function groupFinancials(records: readonly OperationRecord[], field: GroupField): FinancialGroup[] {
  return [...groupBy(records, field)]
    .map(([key, items]) => ({ key, ...sumFinancials(items) }))
    .sort((a, b) => b.income - a.income)
}

export interface CountGroup {
  key: string | null
  count: number
}

/** Número de operaciones por categoría, ordenado de mayor a menor. */
export function countBy(records: readonly OperationRecord[], field: GroupField): CountGroup[] {
  return [...groupBy(records, field)]
    .map(([key, items]) => ({ key, count: items.length }))
    .sort((a, b) => b.count - a.count)
}
