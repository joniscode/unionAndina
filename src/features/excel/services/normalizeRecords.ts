import { COLUMNS, FIELD_RULES, MARGIN_TOLERANCE_COP, type ColumnKey } from '../../../config/dataContract'
import { parseDateValue } from '../../../lib/dates'
import { calculatedMargin } from '../../../lib/metrics'
import { isBlank, parseNumber, parseSla, parseText } from '../../../lib/parse'
import type { DataIssue, IssueKind, OperationRecord } from '../../../types/operation'
import type { ColumnIndex } from '../validators/validateStructure'
import type { RawSheet } from './readWorkbook'

export interface NormalizeResult {
  records: OperationRecord[]
  issues: DataIssue[]
}

interface RowContext {
  row: readonly unknown[]
  rowNumber: number
  sheetName: string
  index: ColumnIndex
  issues: DataIssue[]
}

const cell = (ctx: RowContext, key: ColumnKey): unknown => ctx.row[ctx.index[key]] ?? null

function report(ctx: RowContext, key: ColumnKey, kind: IssueKind, expected?: string): void {
  const raw = cell(ctx, key)
  ctx.issues.push({
    severity: FIELD_RULES[key].severity,
    kind,
    sheetName: ctx.sheetName,
    rowNumber: ctx.rowNumber,
    column: COLUMNS[key],
    value: isBlank(raw) ? '' : String(raw),
    ...(expected === undefined ? {} : { expected }),
  })
}

/** Reporta un obligatorio vacío o un valor inválido según las reglas del contrato. */
function check<T>(ctx: RowContext, key: ColumnKey, value: T | null, invalid: boolean, invalidKind: IssueKind): T | null {
  if (invalid) report(ctx, key, invalidKind)
  else if (value === null && FIELD_RULES[key].required) report(ctx, key, key === 'id' ? 'missingId' : 'missingRequired')
  return value
}

const text = (ctx: RowContext, key: ColumnKey): string | null => check(ctx, key, parseText(cell(ctx, key)), false, 'missingRequired')

function num(ctx: RowContext, key: ColumnKey): number | null {
  const parsed = parseNumber(cell(ctx, key))
  return check(ctx, key, parsed.value, parsed.invalid, 'invalidNumber')
}

function normalizeRow(ctx: RowContext, date1904: boolean): OperationRecord {
  const date = parseDateValue(cell(ctx, 'date'), date1904)
  const sla = parseSla(cell(ctx, 'sla'))

  const record: OperationRecord = {
    rowNumber: ctx.rowNumber,
    id: text(ctx, 'id'),
    date: check(ctx, 'date', date.value, date.invalid, 'invalidDate'),
    zone: text(ctx, 'zone'),
    route: text(ctx, 'route'),
    serviceType: text(ctx, 'serviceType'),
    client: text(ctx, 'client'),
    vehicle: text(ctx, 'vehicle'),
    kilometers: num(ctx, 'kilometers'),
    plannedHours: num(ctx, 'plannedHours'),
    actualHours: num(ctx, 'actualHours'),
    status: text(ctx, 'status'),
    slaMet: check(ctx, 'sla', sla.value, sla.unknown, 'unknownSla'),
    slaRaw: sla.raw,
    income: num(ctx, 'income'),
    cost: num(ctx, 'cost'),
    reportedMargin: num(ctx, 'reportedMargin'),
    rating: num(ctx, 'rating'),
  }

  const computed = calculatedMargin(record)
  if (computed !== null && record.reportedMargin !== null && Math.abs(computed - record.reportedMargin) > MARGIN_TOLERANCE_COP) {
    report(ctx, 'reportedMargin', 'marginMismatch', String(computed))
  }
  return record
}

/** Convierte las filas crudas en registros tipados; omite filas totalmente vacías. */
export function normalizeRecords(sheet: RawSheet, index: ColumnIndex, date1904 = false): NormalizeResult {
  const records: OperationRecord[] = []
  const issues: DataIssue[] = []
  sheet.rows.slice(1).forEach((row, offset) => {
    if (row.every(isBlank)) return
    const ctx: RowContext = { row, rowNumber: sheet.headerRowNumber + offset + 1, sheetName: sheet.name, index, issues }
    records.push(normalizeRow(ctx, date1904))
  })
  return { records, issues }
}
