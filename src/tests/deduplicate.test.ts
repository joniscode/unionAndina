import { describe, expect, it } from 'vitest'
import { deduplicate } from '../features/excel/services/deduplicate'
import { computeKpis } from '../lib/metrics'
import { buildDataWorkbook, makeRecord, makeRow, previewOf } from './helpers'

describe('detección de duplicados', () => {
  it('detecta duplicados por ID_Operacion e informa identificador y filas', () => {
    const preview = previewOf(
      buildDataWorkbook([
        makeRow({ ID_Operacion: 'OP-1' }),
        makeRow({ ID_Operacion: 'OP-2' }),
        makeRow({ ID_Operacion: 'OP-1' }),
        makeRow({ ID_Operacion: 'OP-1' }),
      ]),
    )
    expect(preview.summary.rowsRead).toBe(4)
    expect(preview.records).toHaveLength(2)
    expect(preview.summary.duplicatesDiscarded).toBe(2)
    expect(preview.duplicates).toEqual([{ id: 'OP-1', keptRow: 2, discardedRows: [4, 5], conflictingRows: [] }])
  })

  it('conserva la primera aparición de la operación', () => {
    const { unique } = deduplicate([
      makeRecord({ id: 'OP-1', rowNumber: 2, income: 100 }),
      makeRecord({ id: 'OP-1', rowNumber: 3, income: 999 }),
    ])
    expect(unique).toHaveLength(1)
    expect(unique[0]).toMatchObject({ rowNumber: 2, income: 100 })
  })

  it('no agrupa registros sin identificador', () => {
    const result = deduplicate([makeRecord({ id: null, rowNumber: 2 }), makeRecord({ id: null, rowNumber: 3 })])
    expect(result.unique).toHaveLength(2)
    expect(result.discarded).toBe(0)
  })

  it('los duplicados no afectan los totales', () => {
    const preview = previewOf(
      buildDataWorkbook([
        makeRow({ ID_Operacion: 'OP-1', Ingresos_COP: 1000, Costos_COP: 600, Margen_COP: 400 }),
        makeRow({ ID_Operacion: 'OP-1', Ingresos_COP: 1000, Costos_COP: 600, Margen_COP: 400 }),
      ]),
    )
    const kpis = computeKpis(preview.records)
    expect(kpis.totalOperations).toBe(1)
    expect(kpis.financial.income.value).toBe(1000)
  })

  it('advierte cuando un duplicado tiene contenido diferente (riesgo de pérdida de registro legítimo)', () => {
    const preview = previewOf(
      buildDataWorkbook([
        makeRow({ ID_Operacion: 'OP-1', Ingresos_COP: 1000 }),
        makeRow({ ID_Operacion: 'OP-1', Ingresos_COP: 1000 }),
        makeRow({ ID_Operacion: 'OP-1', Ingresos_COP: 5000, Margen_COP: 4400 }),
      ]),
    )
    expect(preview.duplicates).toEqual([{ id: 'OP-1', keptRow: 2, discardedRows: [3, 4], conflictingRows: [4] }])
    expect(preview.summary.warnings).toBe(1)
    expect(preview.records[0]?.income).toBe(1000)
  })

  it('los registros sin identificador no se agrupan y se excluyen por error', () => {
    const preview = previewOf(
      buildDataWorkbook([makeRow({ ID_Operacion: 'OP-1' }), makeRow({ ID_Operacion: null }), makeRow({ ID_Operacion: '  ' })]),
    )
    expect(preview.summary).toMatchObject({ uniqueRecords: 3, excludedRecords: 2, usableRecords: 1, errors: 2, duplicatesDiscarded: 0 })
    expect(preview.records.map((r) => r.id)).toEqual(['OP-1'])
  })
})
