import type { OperationRecord } from '../types/operation'

/**
 * Política financiera (ver README, "Fórmulas"):
 * - Ingresos: suma de todos los ingresos válidos, aunque el costo falte.
 * - Costos: suma de todos los costos válidos, aunque el ingreso falte.
 * - Margen: Ingresos − Costos SOLO de registros con ambos importes válidos.
 * - % margen: Margen / Ingresos de esa misma base.
 * - Sin registros válidos el total es null ("N/D"), nunca $0.
 * - Margen_COP del Excel se conserva como valor informado y solo se usa para detectar discrepancias.
 */
export interface AmountTotal {
  /** null cuando no hay registros con datos suficientes o el resultado no es finito. */
  value: number | null
  /** Registros que forman la base del total. */
  records: number
}

export interface FinancialTotals {
  income: AmountTotal
  cost: AmountTotal
  margin: AmountTotal
  /** Ingresos de los registros incluidos en el margen (denominador del %). */
  marginIncomeBase: number | null
  marginPct: number | null
  totalRecords: number
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
  sla: SlaSummary
}

const finiteOrNull = (value: number): number | null => (Number.isFinite(value) ? value : null)

export function ratioPercent(numerator: number, denominator: number): number | null {
  if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator <= 0) return null
  return finiteOrNull((numerator / denominator) * 100)
}

/** Margen de análisis de un registro: Ingresos − Costos, o null si falta alguno. */
export function calculatedMargin(record: Pick<OperationRecord, 'income' | 'cost'>): number | null {
  return record.income !== null && record.cost !== null ? finiteOrNull(record.income - record.cost) : null
}

function total(values: (number | null)[]): AmountTotal {
  const valid = values.filter((value): value is number => value !== null && Number.isFinite(value))
  if (valid.length === 0) return { value: null, records: 0 }
  return { value: finiteOrNull(valid.reduce((sum, value) => sum + value, 0)), records: valid.length }
}

export function sumFinancials(records: readonly OperationRecord[]): FinancialTotals {
  const margin = total(records.map(calculatedMargin))
  const marginIncomeBase = total(records.filter((record) => calculatedMargin(record) !== null).map((record) => record.income)).value
  return {
    income: total(records.map((record) => record.income)),
    cost: total(records.map((record) => record.cost)),
    margin,
    marginIncomeBase,
    marginPct: margin.value === null || marginIncomeBase === null ? null : ratioPercent(margin.value, marginIncomeBase),
    totalRecords: records.length,
  }
}

/** true si algún importe se calcula sobre una base menor que el total de operaciones. */
export function hasIncompleteFinancials(totals: FinancialTotals): boolean {
  const { income, cost, margin, totalRecords } = totals
  return income.records < totalRecords || cost.records < totalRecords || margin.records < totalRecords
}

export function summarizeSla(records: readonly OperationRecord[]): SlaSummary {
  const evaluated = records.filter((record) => record.slaMet !== null)
  const met = evaluated.filter((record) => record.slaMet === true).length
  return { met, evaluated: evaluated.length, pct: ratioPercent(met, evaluated.length) }
}

export function computeKpis(records: readonly OperationRecord[]): Kpis {
  return { totalOperations: records.length, financial: sumFinancials(records), sla: summarizeSla(records) }
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

export interface FinancialGroup {
  key: string | null
  income: number | null
  cost: number | null
  margin: number | null
}

/** Grupos sin ingresos válidos van al final. */
function byIncomeDesc(a: FinancialGroup, b: FinancialGroup): number {
  if (a.income === null || b.income === null) return a.income === b.income ? 0 : a.income === null ? 1 : -1
  return b.income - a.income
}

/** Totales por categoría con la misma política que los indicadores; ordenados por ingresos. */
export function groupFinancials(records: readonly OperationRecord[], field: GroupField): FinancialGroup[] {
  return [...groupBy(records, field)]
    .map(([key, items]) => {
      const totals = sumFinancials(items)
      return { key, income: totals.income.value, cost: totals.cost.value, margin: totals.margin.value }
    })
    .sort(byIncomeDesc)
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
