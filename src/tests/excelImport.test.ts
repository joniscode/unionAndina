import { describe, expect, it } from 'vitest'
import { COLUMNS, REQUIRED_COLUMNS } from '../config/dataContract'
import { processWorkbook } from '../features/excel/services/processWorkbook'
import { buildDataWorkbook, buildWorkbook, makeRow, previewOf, readDemoFile } from './helpers'

describe('lectura de un Excel válido', () => {
  it('lee la hoja "Datos" del archivo de referencia e ignora las hojas auxiliares', () => {
    const preview = previewOf(readDemoFile(), 'Datos_Sinteticos_Prueba_Tecnica_Unatrans.xlsx')
    expect(preview.sheetName).toBe('Datos')
    expect(preview.records).toHaveLength(160)
    expect(preview.issues).toEqual([])
    expect(preview.summary).toEqual({
      rowsRead: 160,
      duplicatesDiscarded: 0,
      uniqueRecords: 160,
      cleanRecords: 160,
      recordsWithIssues: 0,
      excludedRecords: 0,
      usableRecords: 160,
      warnings: 0,
      errors: 0,
    })
  })

  it('normaliza tipos: texto, fecha ISO sin zona horaria, números y SLA', () => {
    const [first] = previewOf(readDemoFile()).records
    expect(first).toMatchObject({
      rowNumber: 2,
      id: 'OP-0001',
      date: '2025-01-06',
      zone: 'Bogotá',
      client: 'Cliente B',
      status: 'Con novedad',
      slaMet: false,
      income: 496778,
      cost: 251386,
      reportedMargin: 245392,
    })
  })

  it('acepta columnas en distinto orden y columnas adicionales', () => {
    const columns = [...REQUIRED_COLUMNS].reverse().concat('Columna_Extra')
    const data = buildWorkbook({ Hoja1: [columns, makeRow({ Columna_Extra: 'x' } as never, columns)] })
    expect(previewOf(data).records[0]?.income).toBe(1000)
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

  it('rechaza un archivo en el que ningún registro es utilizable', () => {
    const outcome = processWorkbook(buildDataWorkbook([makeRow({ ID_Operacion: null })]), 'sin-ids.xlsx')
    expect(outcome).toEqual({ ok: false, error: { code: 'noUsableRecords', sheetName: 'Datos' } })
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

describe('H02 · campos vacíos e inválidos', () => {
  it('reporta cada obligatorio vacío con hoja, fila, columna y severidad, sin bloquear el archivo', () => {
    const preview = previewOf(
      buildDataWorkbook([
        makeRow({
          Zona: null,
          Cliente_Anonimizado: '',
          Tipo_Servicio: '  ',
          Fecha: null,
          Estado: null,
          Cumplimiento_SLA: null,
          Ingresos_COP: null,
          Costos_COP: null,
          Margen_COP: null,
        }),
      ]),
    )
    expect(preview.records[0]).toMatchObject({ zone: null, client: null, serviceType: null, date: null, slaMet: null, income: null })
    const columns = preview.issues.map((issue) => issue.column)
    expect(columns).toEqual([
      COLUMNS.date,
      COLUMNS.zone,
      COLUMNS.serviceType,
      COLUMNS.client,
      COLUMNS.status,
      COLUMNS.sla,
      COLUMNS.income,
      COLUMNS.cost,
      COLUMNS.reportedMargin,
    ])
    expect(preview.issues.every((i) => i.severity === 'warning' && i.kind === 'missingRequired')).toBe(true)
    expect(preview.issues[0]).toMatchObject({ sheetName: 'Datos', rowNumber: 2 })
  })

  it('no reporta campos opcionales vacíos, pero sí opcionales inválidos', () => {
    const empty = previewOf(buildDataWorkbook([makeRow({ Ruta: null, Vehiculo_Codigo: null, Kilometros: null, Calificacion_Servicio_1a5: null })]))
    expect(empty.issues).toEqual([])
    const invalid = previewOf(buildDataWorkbook([makeRow({ Kilometros: 'cien' })]))
    expect(invalid.issues).toMatchObject([{ kind: 'invalidNumber', column: COLUMNS.kilometers, severity: 'warning' }])
  })

  it('un ID vacío es un error: el registro se excluye de los cálculos', () => {
    const preview = previewOf(buildDataWorkbook([makeRow({ ID_Operacion: 'OP-1' }), makeRow({ ID_Operacion: null })]))
    expect(preview.issues).toMatchObject([{ kind: 'missingId', severity: 'error', rowNumber: 3, column: COLUMNS.id }])
    expect(preview.records.map((r) => r.id)).toEqual(['OP-1'])
  })

  it('no convierte importes inválidos en cero y registra la advertencia', () => {
    const preview = previewOf(buildDataWorkbook([makeRow({ Costos_COP: 'mil pesos' })]))
    expect(preview.records[0]?.cost).toBeNull()
    expect(preview.issues).toContainEqual({
      severity: 'warning',
      kind: 'invalidNumber',
      sheetName: 'Datos',
      rowNumber: 2,
      column: COLUMNS.cost,
      value: 'mil pesos',
    })
  })

  it('acepta texto numérico plano', () => {
    expect(previewOf(buildDataWorkbook([makeRow({ Ingresos_COP: '1500', Margen_COP: 900 })])).records[0]?.income).toBe(1500)
  })

  it('advierte valores de SLA no reconocidos sin bloquear la carga', () => {
    const preview = previewOf(buildDataWorkbook([makeRow({ Cumplimiento_SLA: 'Tal vez' })]))
    expect(preview.records[0]?.slaMet).toBeNull()
    expect(preview.issues.map((i) => i.kind)).toEqual(['unknownSla'])
  })

  it('reporta fechas imposibles como inválidas (H01)', () => {
    const preview = previewOf(buildDataWorkbook([makeRow({ Fecha: '2025-02-31' })]))
    expect(preview.records[0]?.date).toBeNull()
    expect(preview.issues).toMatchObject([{ kind: 'invalidDate', column: COLUMNS.date, value: '2025-02-31' }])
  })
})

describe('H03 · resumen de importación', () => {
  it('cuenta filas con incidencias una sola vez y separa advertencias y errores', () => {
    const preview = previewOf(
      buildDataWorkbook([
        makeRow({ ID_Operacion: 'OP-1' }),
        makeRow({ ID_Operacion: 'OP-2', Zona: null, Cliente_Anonimizado: null, Costos_COP: 'x' }),
        makeRow({ ID_Operacion: null, Zona: null }),
        makeRow({ ID_Operacion: 'OP-1' }),
      ]),
    )
    expect(preview.summary).toEqual({
      rowsRead: 4,
      duplicatesDiscarded: 1,
      uniqueRecords: 3,
      cleanRecords: 1,
      recordsWithIssues: 2,
      excludedRecords: 1,
      usableRecords: 2,
      warnings: 4,
      errors: 1,
    })
  })
})

describe('H04 · consistencia del margen', () => {
  it('advierte la discrepancia y conserva el margen informado sin modificarlo', () => {
    const preview = previewOf(buildDataWorkbook([makeRow({ Ingresos_COP: 1000, Costos_COP: 600, Margen_COP: 999 })]))
    expect(preview.records[0]?.reportedMargin).toBe(999)
    expect(preview.issues).toMatchObject([{ kind: 'marginMismatch', value: '999', expected: '400', column: COLUMNS.reportedMargin }])
  })
})

describe('H07 · límites de importación', () => {
  it('rechaza archivos que superan el tamaño máximo', () => {
    const data = buildDataWorkbook([makeRow()])
    expect(processWorkbook(data, 'grande.xlsx', { maxFileBytes: 100 })).toEqual({ ok: false, error: { code: 'fileTooLarge' } })
  })

  it('rechaza hojas con más registros que el máximo, sin truncar en silencio', () => {
    const rows = ['A', 'B', 'C'].map((id) => makeRow({ ID_Operacion: id }))
    const outcome = processWorkbook(buildDataWorkbook(rows), 'muchos.xlsx', { maxRecords: 2 })
    expect(outcome).toEqual({ ok: false, error: { code: 'tooManyRecords', sheetName: 'Datos' } })
    expect(processWorkbook(buildDataWorkbook(rows), 'justo.xlsx', { maxRecords: 3 }).ok).toBe(true)
  })
})

describe('H08 · números no finitos', () => {
  it('marca como inválido un texto numérico que desborda a Infinity', () => {
    const huge = '9'.repeat(400)
    const preview = previewOf(buildDataWorkbook([makeRow({ Ingresos_COP: huge })]))
    expect(preview.records[0]?.income).toBeNull()
    expect(preview.issues.map((i) => i.kind)).toEqual(['invalidNumber'])
  })
})
