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
    expect(preview.rowsRead).toBe(4)
    expect(preview.records).toHaveLength(2)
    expect(preview.duplicatesDiscarded).toBe(2)
    expect(preview.duplicates).toEqual([{ id: 'OP-1', keptRow: 2, discardedRows: [4, 5] }])
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
    expect(kpis.financial.income).toBe(1000)
  })
})
