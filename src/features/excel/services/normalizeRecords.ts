import { COLUMNS, MARGIN_TOLERANCE_COP, NUMERIC_COLUMNS, type ColumnKey } from '../../../config/dataContract'
import { isBlank, parseDate, parseNumber, parseSla, parseText } from '../../../lib/parse'
import type { DataIssue, OperationRecord } from '../../../types/operation'
import type { ColumnIndex } from '../validators/validateStructure'
import type { RawSheet } from './readWorkbook'

export interface NormalizeResult {
  records: OperationRecord[]
  issues: DataIssue[]
}

type NumericKey = (typeof NUMERIC_COLUMNS)[number]

function displayValue(value: unknown): string {
  return value instanceof Date ? value.toISOString() : String(value)
}

function normalizeRow(row: readonly unknown[], rowNumber: number, index: ColumnIndex, issues: DataIssue[]): OperationRecord {
  const cell = (key: ColumnKey): unknown => row[index[key]] ?? null
  const report = (kind: DataIssue['kind'], key: ColumnKey): void => {
    issues.push({ kind, rowNumber, column: COLUMNS[key], value: displayValue(cell(key)) })
  }

  const numbers = {} as Record<NumericKey, number | null>
  for (const key of NUMERIC_COLUMNS) {
    const parsed = parseNumber(cell(key))
    if (parsed.invalid) report('invalidNumber', key)
    numbers[key] = parsed.value
  }

  const date = parseDate(cell('date'))
  if (date.invalid) report('invalidDate', 'date')

  const sla = parseSla(cell('sla'))
  if (sla.unknown) report('unknownSla', 'sla')

  const id = parseText(cell('id'))
  if (id === null) issues.push({ kind: 'missingId', rowNumber, column: COLUMNS.id, value: '' })

  const { income, cost, margin } = numbers
  if (income !== null && cost !== null && margin !== null && Math.abs(income - cost - margin) > MARGIN_TOLERANCE_COP) {
    report('marginMismatch', 'margin')
  }

  return {
    rowNumber,
    id,
    date: date.value,
    zone: parseText(cell('zone')),
    route: parseText(cell('route')),
    serviceType: parseText(cell('serviceType')),
    client: parseText(cell('client')),
    vehicle: parseText(cell('vehicle')),
    status: parseText(cell('status')),
    slaMet: sla.value,
    slaRaw: sla.raw,
    ...numbers,
  }
}

/** Convierte las filas crudas en registros tipados; omite filas totalmente vacías. */
export function normalizeRecords(sheet: RawSheet, index: ColumnIndex): NormalizeResult {
  const records: OperationRecord[] = []
  const issues: DataIssue[] = []
  sheet.rows.slice(1).forEach((row, offset) => {
    if (row.every(isBlank)) return
    const rowNumber = sheet.headerRowNumber + offset + 1
    records.push(normalizeRow(row, rowNumber, index, issues))
  })
  return { records, issues }
}
