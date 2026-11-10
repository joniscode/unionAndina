import { describe, expect, it } from 'vitest'
import { daysInMonth, excelSerialToIso, formatIsoDate, isLeapYear, isValidCalendarDate, parseDateValue } from '../lib/dates'
import { utils, write } from 'xlsx'
import { REQUIRED_COLUMNS } from '../config/dataContract'
import { buildDataWorkbook, makeRow, previewOf } from './helpers'

describe('H01 · validación de calendario', () => {
  it('rechaza fechas imposibles en lugar de desplazarlas', () => {
    expect(parseDateValue('2025-02-31')).toEqual({ value: null, invalid: true })
    expect(parseDateValue('2025-04-31')).toEqual({ value: null, invalid: true })
    expect(parseDateValue('2025-13-01')).toEqual({ value: null, invalid: true })
    expect(parseDateValue('31/02/2025')).toEqual({ value: null, invalid: true })
    expect(parseDateValue('00/01/2025')).toEqual({ value: null, invalid: true })
  })

  it('aplica la regla de años bisiestos', () => {
    expect(isLeapYear(2024)).toBe(true)
    expect(isLeapYear(2025)).toBe(false)
    expect(isLeapYear(1900)).toBe(false)
    expect(isLeapYear(2000)).toBe(true)
    expect(daysInMonth(2024, 2)).toBe(29)
    expect(parseDateValue('2024-02-29').value).toBe('2024-02-29')
    expect(parseDateValue('29/02/2024').value).toBe('2024-02-29')
    expect(parseDateValue('2025-02-29').invalid).toBe(true)
    expect(parseDateValue('2100-02-29').invalid).toBe(true)
    expect(isValidCalendarDate(2000, 2, 29)).toBe(true)
  })
})

describe('fechas numéricas de Excel', () => {
  it('convierte series del sistema 1900 (incluido el día ficticio 29/02/1900)', () => {
    expect(excelSerialToIso(1)).toBe('1900-01-01')
    expect(excelSerialToIso(59)).toBe('1900-02-28')
    expect(excelSerialToIso(60)).toBeNull()
    expect(excelSerialToIso(61)).toBe('1900-03-01')
    expect(excelSerialToIso(45658)).toBe('2025-01-01')
    expect(excelSerialToIso(45691)).toBe('2025-02-03')
    expect(excelSerialToIso(45351)).toBe('2024-02-29')
  })

  it('convierte series del sistema 1904', () => {
    expect(excelSerialToIso(0, true)).toBe('1904-01-01')
    expect(excelSerialToIso(44196, true)).toBe('2025-01-01')
  })

  it('ignora la fracción horaria y rechaza series fuera de rango o no finitas', () => {
    expect(excelSerialToIso(45691.99)).toBe('2025-02-03')
    expect(excelSerialToIso(0)).toBeNull()
    expect(excelSerialToIso(-5)).toBeNull()
    expect(excelSerialToIso(3_000_000)).toBeNull()
    expect(excelSerialToIso(Number.NaN)).toBeNull()
  })

  it('respeta el sistema de fechas declarado por el libro (1904)', () => {
    const workbook = utils.book_new()
    utils.book_append_sheet(workbook, utils.aoa_to_sheet([[...REQUIRED_COLUMNS], makeRow({ Fecha: 44196 })]), 'Datos')
    workbook.Workbook = { WBProps: { date1904: true } }
    const data = write(workbook, { type: 'array', bookType: 'xlsx' }) as ArrayBuffer
    expect(previewOf(data).records[0]?.date).toBe('2025-01-01')
  })

  it('lee celdas con formato de fecha y números con formato General', () => {
    const preview = previewOf(buildDataWorkbook([makeRow({ ID_Operacion: 'A', Fecha: 45691 }), makeRow({ ID_Operacion: 'B', Fecha: '03/02/2025' })]))
    expect(preview.records.map((r) => r.date)).toEqual(['2025-02-03', '2025-02-03'])
    // SheetJS, como Excel, guarda la fecha local de calendario como número de serie con formato de fecha.
    const dated = utils.aoa_to_sheet([[...REQUIRED_COLUMNS], makeRow({ Fecha: new Date(2025, 1, 3) })])
    const workbook = utils.book_new()
    utils.book_append_sheet(workbook, dated, 'Datos')
    expect(dated.B2?.t).toBe('n')
    expect(previewOf(buildWorkbookFrom(workbook)).records[0]?.date).toBe('2025-02-03')
  })

  it('reporta fechas de texto con formato no admitido', () => {
    const preview = previewOf(buildDataWorkbook([makeRow({ Fecha: 'ayer' })]))
    expect(preview.issues.map((i) => i.kind)).toEqual(['invalidDate'])
  })
})

describe('presentación DD/MM/AAAA', () => {
  it('formatea sin pasar por zonas horarias', () => {
    expect(formatIsoDate('2025-02-03')).toBe('03/02/2025')
    expect(formatIsoDate('2024-12-31')).toBe('31/12/2024')
  })
})

function buildWorkbookFrom(workbook: ReturnType<typeof utils.book_new>): ArrayBuffer {
  return write(workbook, { type: 'array', bookType: 'xlsx' }) as ArrayBuffer
}
