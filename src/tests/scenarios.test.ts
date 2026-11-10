/**
 * Archivos de escenario suministrados para la auditoría (copiados sin modificar a tests/fixtures).
 * Los valores esperados se calcularon de forma independiente con Python/openpyxl.
 */
import { describe, expect, it } from 'vitest'
import { COLUMNS } from '../config/dataContract'
import { importReducer, initialImportState, type ImportAction, type ImportState } from '../features/excel/hooks/importReducer'
import { processWorkbook } from '../features/excel/services/processWorkbook'
import { buildFilterOptions } from '../lib/filters'
import { computeKpis } from '../lib/metrics'
import type { ImportOutcome } from '../types/operation'
import { previewOf, readDemoFile, readFixture, SCENARIO_1, SCENARIO_2 } from './helpers'

function confirmLoad(state: ImportState, outcome: ImportOutcome, requestId: number): ImportState {
  const actions: ImportAction[] = [
    { type: 'start', fileName: `f${requestId}.xlsx`, requestId },
    { type: 'read', requestId },
    { type: 'processed', requestId, outcome },
    { type: 'confirm' },
    { type: 'applied', loadedAt: requestId },
  ]
  return actions.reduce(importReducer, state)
}

describe('Escenario 1 · reemplazo con ubicaciones nuevas', () => {
  const preview = previewOf(readFixture(SCENARIO_1), 'Escenario_1_Reemplazo_Ciudades_Validas.xlsx')

  it('lee 36 registros sin incidencias y convierte las fechas numéricas', () => {
    expect(preview.summary).toMatchObject({ rowsRead: 36, uniqueRecords: 36, cleanRecords: 36, warnings: 0, errors: 0 })
    expect(preview.records[0]?.date).toBe('2025-02-03')
    expect(preview.records.at(-1)?.date).toBe('2025-03-10')
  })

  it('reemplaza las opciones de ubicación y recalcula los indicadores', () => {
    const afterDemo = confirmLoad(initialImportState, processWorkbook(readDemoFile(), 'demo.xlsx'), 1)
    const afterScenario = confirmLoad(afterDemo, { ok: true, preview }, 2)
    const records = afterScenario.active?.records ?? []
    expect(buildFilterOptions(records).zone).toEqual(['Cali', 'Cartagena', 'Medellín'])
    expect(buildFilterOptions(records).status).toEqual(['Completado', 'Con novedad', 'Pendiente'])
    const { financial, sla } = computeKpis(records)
    expect(financial.income).toEqual({ value: 34_182_000, records: 36 })
    expect(financial.cost).toEqual({ value: 22_830_840, records: 36 })
    expect(financial.margin).toEqual({ value: 11_351_160, records: 36 })
    expect(sla).toMatchObject({ met: 27, evaluated: 36 })
  })
})

describe('Escenario 2 · duplicados y campos erróneos', () => {
  const preview = previewOf(readFixture(SCENARIO_2), 'Escenario_2_Duplicados_Campos_Erroneos.xlsx')

  it('descarta los duplicados idénticos conservando la primera aparición', () => {
    expect(preview.duplicates).toEqual([
      { id: 'ESC-0002', keptRow: 3, discardedRows: [14], conflictingRows: [] },
      { id: 'ESC-0006', keptRow: 7, discardedRows: [15], conflictingRows: [] },
    ])
  })

  it('genera una advertencia precisa por cada campo erróneo', () => {
    expect(preview.issues.map((i) => [i.rowNumber, i.column, i.kind, i.severity])).toEqual([
      [16, COLUMNS.client, 'missingRequired', 'warning'],
      [17, COLUMNS.income, 'invalidNumber', 'warning'],
      [18, COLUMNS.cost, 'missingRequired', 'warning'],
      [19, COLUMNS.zone, 'missingRequired', 'warning'],
    ])
    expect(preview.issues.every((i) => i.sheetName === 'Datos')).toBe(true)
    expect(preview.summary).toEqual({
      rowsRead: 18,
      duplicatesDiscarded: 2,
      uniqueRecords: 16,
      cleanRecords: 12,
      recordsWithIssues: 4,
      excludedRecords: 0,
      usableRecords: 16,
      warnings: 4,
      errors: 0,
    })
  })

  it('las advertencias no contaminan los cálculos', () => {
    const { financial, totalOperations } = computeKpis(preview.records)
    expect(totalOperations).toBe(16)
    expect(financial.income).toEqual({ value: 10_206_000, records: 15 })
    expect(financial.cost).toEqual({ value: 6_699_780, records: 15 })
    expect(financial.margin).toEqual({ value: 3_144_060, records: 14 })
    expect(financial.marginPct).toBeCloseTo(33.818, 3)
  })
})
