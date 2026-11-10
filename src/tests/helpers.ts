import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { utils, write } from 'xlsx'
import { COLUMNS, REQUIRED_COLUMNS } from '../config/dataContract'
import { processWorkbook } from '../features/excel/services/processWorkbook'
import type { ImportPreview, OperationRecord } from '../types/operation'

export const DEMO_FILE = resolve(process.cwd(), 'public/demo/datos-sinteticos-unatrans.xlsx')

export function readDemoFile(): ArrayBuffer {
  const buffer = readFileSync(DEMO_FILE)
  return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) as ArrayBuffer
}

type RowValues = Partial<Record<(typeof COLUMNS)[keyof typeof COLUMNS], unknown>>

const BASE_ROW: RowValues = {
  [COLUMNS.id]: 'OP-1',
  [COLUMNS.date]: '2025-01-06',
  [COLUMNS.zone]: 'Bogotá',
  [COLUMNS.route]: 'Bogotá–Tunja',
  [COLUMNS.serviceType]: 'Carga general',
  [COLUMNS.client]: 'Cliente A',
  [COLUMNS.vehicle]: 'VEH-001',
  [COLUMNS.kilometers]: 100,
  [COLUMNS.plannedHours]: 2,
  [COLUMNS.actualHours]: 2.5,
  [COLUMNS.status]: 'Completado',
  [COLUMNS.sla]: 'Sí',
  [COLUMNS.income]: 1000,
  [COLUMNS.cost]: 600,
  [COLUMNS.margin]: 400,
  [COLUMNS.rating]: 4,
}

/** Fila con los valores base y las columnas indicadas reemplazadas. */
export function makeRow(overrides: RowValues = {}, columns: readonly string[] = REQUIRED_COLUMNS): unknown[] {
  const values: Record<string, unknown> = { ...BASE_ROW, ...overrides }
  return columns.map((column) => values[column] ?? null)
}

/** Construye un .xlsx en memoria con las hojas indicadas (matrices de filas). */
export function buildWorkbook(sheets: Record<string, unknown[][]>): ArrayBuffer {
  const workbook = utils.book_new()
  for (const [name, rows] of Object.entries(sheets)) {
    utils.book_append_sheet(workbook, utils.aoa_to_sheet(rows), name)
  }
  return write(workbook, { type: 'array', bookType: 'xlsx' }) as ArrayBuffer
}

export function buildDataWorkbook(rows: unknown[][], extraSheets: Record<string, unknown[][]> = {}): ArrayBuffer {
  return buildWorkbook({ ...extraSheets, Datos: [[...REQUIRED_COLUMNS], ...rows] })
}

/** Procesa un libro y falla el test si no es válido. */
export function previewOf(data: ArrayBuffer, fileName = 'prueba.xlsx'): ImportPreview {
  const outcome = processWorkbook(data, fileName)
  if (!outcome.ok) throw new Error(`Importación inesperadamente inválida: ${outcome.error.code}`)
  return outcome.preview
}

export function makeRecord(overrides: Partial<OperationRecord> = {}): OperationRecord {
  return {
    rowNumber: 2,
    id: 'OP-1',
    date: null,
    zone: 'Bogotá',
    route: null,
    serviceType: 'Carga general',
    client: 'Cliente A',
    vehicle: null,
    kilometers: null,
    plannedHours: null,
    actualHours: null,
    status: 'Completado',
    slaMet: true,
    slaRaw: 'Sí',
    income: 1000,
    cost: 600,
    margin: 400,
    rating: null,
    ...overrides,
  }
}
