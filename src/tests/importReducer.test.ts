import { describe, expect, it } from 'vitest'
import { importReducer, initialImportState, type ImportAction, type ImportState } from '../features/excel/hooks/importReducer'
import { processWorkbook } from '../features/excel/services/processWorkbook'
import type { ImportOutcome } from '../types/operation'
import { buildDataWorkbook, makeRow, readDemoFile } from './helpers'

function run(state: ImportState, ...actions: ImportAction[]): ImportState {
  return actions.reduce(importReducer, state)
}

/** Simula el flujo completo de una carga: inicio → lectura → validación → (confirmación). */
function load(state: ImportState, outcome: ImportOutcome, requestId: number, confirm = true): ImportState {
  const fileName = outcome.ok ? outcome.preview.fileName : 'error.xlsx'
  const steps: ImportAction[] = [
    { type: 'start', fileName, requestId },
    { type: 'read', requestId },
    { type: 'processed', requestId, outcome },
  ]
  if (confirm) steps.push({ type: 'confirm' }, { type: 'applied', loadedAt: requestId })
  return run(state, ...steps)
}

const fileA = processWorkbook(
  buildDataWorkbook([makeRow({ ID_Operacion: 'A-1', Zona: 'Bogotá' }), makeRow({ ID_Operacion: 'A-2', Zona: 'Bogotá' })]),
  'a.xlsx',
)
const fileB = processWorkbook(buildDataWorkbook([makeRow({ ID_Operacion: 'B-1', Zona: 'Santander' })]), 'b.xlsx')
const invalid = processWorkbook(buildDataWorkbook([]), 'vacio.xlsx')

describe('flujo de importación', () => {
  it('no activa datos hasta confirmar', () => {
    const state = load(initialImportState, fileA, 1, false)
    expect(state.flow.stage).toBe('review')
    expect(state.active).toBeNull()
  })

  it('reemplaza completamente los datos al confirmar un nuevo archivo', () => {
    const afterA = load(initialImportState, fileA, 1)
    const afterB = load(afterA, fileB, 2)
    expect(afterB.active?.fileName).toBe('b.xlsx')
    expect(afterB.active?.records.map((r) => r.id)).toEqual(['B-1'])
    expect(afterB.active?.records.some((r) => r.zone === 'Bogotá')).toBe(false)
  })

  it('conserva los datos activos si la nueva carga se cancela', () => {
    const afterA = load(initialImportState, fileA, 1)
    const cancelled = run(load(afterA, fileB, 2, false), { type: 'cancel' })
    expect(cancelled.flow.stage).toBe('idle')
    expect(cancelled.active).toBe(afterA.active)
  })

  it('conserva los datos activos si la nueva carga es rechazada', () => {
    const afterA = load(initialImportState, fileA, 1)
    const failed = load(afterA, invalid, 2, false)
    expect(failed.flow.stage).toBe('error')
    expect(failed.active).toBe(afterA.active)
  })

  it('ignora confirmaciones duplicadas', () => {
    const review = load(initialImportState, fileA, 1, false)
    const once = run(review, { type: 'confirm' })
    expect(run(once, { type: 'confirm' })).toBe(once)
    const applied = run(once, { type: 'applied', loadedAt: 1 })
    expect(run(applied, { type: 'applied', loadedAt: 2 })).toBe(applied)
  })

  it('ignora resultados de una lectura obsoleta', () => {
    const started = run(initialImportState, { type: 'start', fileName: 'a.xlsx', requestId: 1 }, { type: 'cancel' })
    expect(run(started, { type: 'processed', requestId: 1, outcome: fileA }).flow.stage).toBe('idle')
  })
})

describe('datos de demostración', () => {
  it('restablece la demo reemplazando los datos cargados y la marca como demostración', () => {
    const demo = processWorkbook(readDemoFile(), 'demo.xlsx', 'demo')
    const afterB = load(initialImportState, fileB, 1)
    const restored = load(afterB, demo, 2)
    expect(restored.active?.source).toBe('demo')
    expect(restored.active?.records).toHaveLength(160)
    expect(restored.active?.records.some((r) => r.id === 'B-1')).toBe(false)
  })
})

describe('volver al inicio', () => {
  it('descarta los datos activos y vuelve al estado inicial', () => {
    const afterA = load(initialImportState, fileA, 1)
    expect(run(afterA, { type: 'reset' })).toEqual(initialImportState)
  })

  it('no interrumpe una carga que se está aplicando', () => {
    const applying = run(load(initialImportState, fileA, 1, false), { type: 'confirm' })
    expect(run(applying, { type: 'reset' })).toBe(applying)
  })
})
