import { describe, expect, it } from 'vitest'
import { COLUMNS, REQUIRED_COLUMNS } from '../config/dataContract'
import { processWorkbook } from '../features/excel/services/processWorkbook'
import { buildDataWorkbook, buildWorkbook, makeRow, previewOf, readDemoFile } from './helpers'

describe('lectura de un Excel válido', () => {
  it('lee la hoja "Datos" del archivo de referencia e ignora las hojas auxiliares', () => {
    const preview = previewOf(readDemoFile(), 'Datos_Sinteticos_Prueba_Tecnica_Unatrans.xlsx')
    expect(preview.sheetName).toBe('Datos')
    expect(preview.rowsRead).toBe(160)
    expect(preview.records).toHaveLength(160)
    expect(preview.duplicatesDiscarded).toBe(0)
    expect(preview.issues).toEqual([])
  })

  it('normaliza tipos: texto, fechas, números y SLA', () => {
    const [first] = previewOf(readDemoFile()).records
    expect(first).toMatchObject({
      rowNumber: 2,
      id: 'OP-0001',
      zone: 'Bogotá',
      client: 'Cliente B',
      status: 'Con novedad',
      slaMet: false,
      income: 496778,
      cost: 251386,
      margin: 245392,
    })
    expect(first?.date?.getFullYear()).toBe(2025)
    expect(first?.date?.getMonth()).toBe(0)
    expect(first?.date?.getDate()).toBe(6)
  })

  it('acepta columnas en distinto orden y columnas adicionales', () => {
    const columns = [...REQUIRED_COLUMNS].reverse().concat('Columna_Extra')
    const data = buildWorkbook({ Hoja1: [columns, makeRow({ Columna_Extra: 'x' } as never, columns)] })
    const preview = previewOf(data)
    expect(preview.records[0]?.income).toBe(1000)
  })
})

describe('rechazo de estructura inválida', () => {
  it('bloquea la carga e informa las columnas faltantes', () => {
    const columns = REQUIRED_COLUMNS.filter((c) => c !== COLUMNS.income && c !== COLUMNS.sla)
    const data = buildWorkbook({ Datos: [columns, makeRow({}, columns)] })
    const outcome = processWorkbook(data, 'incompleto.xlsx')
    expect(outcome.ok).toBe(false)
    if (outcome.ok) return
    expect(outcome.error.code).toBe('missingColumns')
    expect(outcome.error.sheetName).toBe('Datos')
    expect(outcome.error.missingColumns).toEqual([COLUMNS.sla, COLUMNS.income])
  })

  it('no confunde una hoja auxiliar con la hoja de datos', () => {
    const data = buildWorkbook({ Diccionario: [['Campo', 'Descripción'], [COLUMNS.id, 'Identificador']] })
    const outcome = processWorkbook(data, 'solo-diccionario.xlsx')
    expect(outcome.ok).toBe(false)
    if (!outcome.ok) expect(outcome.error.missingColumns).toHaveLength(REQUIRED_COLUMNS.length)
  })

  it('rechaza extensiones distintas de .xlsx', () => {
    const outcome = processWorkbook(buildDataWorkbook([makeRow()]), 'datos.csv')
    expect(outcome).toEqual({ ok: false, error: { code: 'invalidExtension' } })
  })

  it('rechaza contenido que no es un libro de Excel con la estructura requerida', () => {
    const garbage = new TextEncoder().encode('esto no es un excel').buffer as ArrayBuffer
    expect(processWorkbook(garbage, 'falso.xlsx').ok).toBe(false)
  })
})

describe('archivos sin registros', () => {
  it('rechaza un archivo con encabezados pero sin filas', () => {
    const outcome = processWorkbook(buildDataWorkbook([]), 'vacio.xlsx')
    expect(outcome).toEqual({ ok: false, error: { code: 'emptyFile', sheetName: 'Datos' } })
  })

  it('ignora filas completamente vacías y conserva la numeración real de filas', () => {
    const blank = REQUIRED_COLUMNS.map(() => null)
    const preview = previewOf(buildDataWorkbook([makeRow({ ID_Operacion: 'A' }), blank, makeRow({ ID_Operacion: 'B' })]))
    expect(preview.records.map((r) => [r.id, r.rowNumber])).toEqual([
      ['A', 2],
      ['B', 4],
    ])
  })
})

describe('campos vacíos e inválidos', () => {
  it('no falla con celdas vacías y las representa como null', () => {
    const preview = previewOf(
      buildDataWorkbook([makeRow({ Zona: null, Cliente_Anonimizado: '', Fecha: null, Cumplimiento_SLA: null, Ingresos_COP: null })]),
    )
    expect(preview.records[0]).toMatchObject({ zone: null, client: null, date: null, slaMet: null, income: null })
  })

  it('no convierte importes inválidos en cero y registra la advertencia', () => {
    const preview = previewOf(buildDataWorkbook([makeRow({ Costos_COP: 'mil pesos' })]))
    expect(preview.records[0]?.cost).toBeNull()
    expect(preview.issues).toContainEqual({ kind: 'invalidNumber', rowNumber: 2, column: COLUMNS.cost, value: 'mil pesos' })
  })

  it('acepta texto numérico plano', () => {
    const preview = previewOf(buildDataWorkbook([makeRow({ Ingresos_COP: '1500' })]))
    expect(preview.records[0]?.income).toBe(1500)
  })

  it('advierte cuando Margen_COP no coincide con Ingresos − Costos', () => {
    const preview = previewOf(buildDataWorkbook([makeRow({ Margen_COP: 999 })]))
    expect(preview.issues.map((i) => i.kind)).toEqual(['marginMismatch'])
  })

  it('advierte valores de SLA no reconocidos sin bloquear la carga', () => {
    const preview = previewOf(buildDataWorkbook([makeRow({ Cumplimiento_SLA: 'Tal vez' })]))
    expect(preview.records[0]?.slaMet).toBeNull()
    expect(preview.issues.map((i) => i.kind)).toEqual(['unknownSla'])
  })
})
