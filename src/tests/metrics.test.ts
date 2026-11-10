import { describe, expect, it } from 'vitest'
import { computeKpis, countBy, groupFinancials } from '../lib/metrics'
import { makeRecord, previewOf, readDemoFile } from './helpers'

describe('cálculo de indicadores', () => {
  it('calcula ingresos, costos, margen y SLA del archivo de referencia', () => {
    const kpis = computeKpis(previewOf(readDemoFile()).records)
    expect(kpis.totalOperations).toBe(160)
    expect(kpis.financial.income).toBe(134_350_665)
    expect(kpis.financial.cost).toBe(104_646_676)
    expect(kpis.financial.margin).toBe(29_703_989)
    expect(kpis.financial.marginPct).toBeCloseTo((29_703_989 / 134_350_665) * 100, 6)
    expect(kpis.sla).toEqual({ met: 89, evaluated: 160, pct: (89 / 160) * 100 })
    expect(kpis.excludedFromFinancials).toBe(0)
  })

  it('excluye de los importes los registros sin ingreso o costo válido', () => {
    const kpis = computeKpis([
      makeRecord({ income: 1000, cost: 600 }),
      makeRecord({ income: 500, cost: null }),
      makeRecord({ income: null, cost: 300 }),
    ])
    expect(kpis.totalOperations).toBe(3)
    expect(kpis.financial).toMatchObject({ income: 1000, cost: 600, margin: 400, records: 1 })
    expect(kpis.excludedFromFinancials).toBe(2)
  })

  it('no calcula porcentaje de margen sin ingresos válidos', () => {
    expect(computeKpis([makeRecord({ income: 0, cost: 100 })]).financial.marginPct).toBeNull()
    expect(computeKpis([]).financial.marginPct).toBeNull()
  })

  it('calcula el SLA solo sobre registros evaluables', () => {
    const sla = computeKpis([makeRecord({ slaMet: true }), makeRecord({ slaMet: false }), makeRecord({ slaMet: null })]).sla
    expect(sla).toEqual({ met: 1, evaluated: 2, pct: 50 })
    expect(computeKpis([]).sla.pct).toBeNull()
  })

  it('agrupa importes por zona y operaciones por estado', () => {
    const records = [
      makeRecord({ zone: 'Bogotá', status: 'Completado', income: 100, cost: 50 }),
      makeRecord({ zone: 'Bogotá', status: 'Cancelado', income: 200, cost: 250 }),
      makeRecord({ zone: 'Antioquia', status: 'Completado', income: 50, cost: 10 }),
    ]
    expect(groupFinancials(records, 'zone')).toMatchObject([
      { key: 'Bogotá', income: 300, cost: 300, margin: 0 },
      { key: 'Antioquia', income: 50, cost: 10, margin: 40 },
    ])
    expect(countBy(records, 'status')).toEqual([
      { key: 'Completado', count: 2 },
      { key: 'Cancelado', count: 1 },
    ])
  })
})
