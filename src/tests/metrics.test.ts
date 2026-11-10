import { describe, expect, it } from 'vitest'
import { calculatedMargin, computeKpis, countBy, groupFinancials, hasIncompleteFinancials, ratioPercent } from '../lib/metrics'
import { makeRecord, previewOf, readDemoFile } from './helpers'

describe('cálculo de indicadores', () => {
  it('calcula ingresos, costos, margen y SLA del archivo de referencia', () => {
    const { financial, sla, totalOperations } = computeKpis(previewOf(readDemoFile()).records)
    expect(totalOperations).toBe(160)
    expect(financial.income).toEqual({ value: 134_350_665, records: 160 })
    expect(financial.cost).toEqual({ value: 104_646_676, records: 160 })
    expect(financial.margin).toEqual({ value: 29_703_989, records: 160 })
    expect(financial.marginPct).toBeCloseTo((29_703_989 / 134_350_665) * 100, 6)
    expect(hasIncompleteFinancials(financial)).toBe(false)
    expect(sla).toEqual({ met: 89, evaluated: 160, pct: (89 / 160) * 100 })
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
    expect(groupFinancials(records, 'zone')).toEqual([
      { key: 'Bogotá', income: 300, cost: 300, margin: 0 },
      { key: 'Antioquia', income: 50, cost: 10, margin: 40 },
    ])
    expect(countBy(records, 'status')).toEqual([
      { key: 'Completado', count: 2 },
      { key: 'Cancelado', count: 1 },
    ])
  })
})

describe('H04 · margen calculado', () => {
  it('el margen de análisis es Ingresos − Costos, aunque Margen_COP informe otro valor', () => {
    const record = makeRecord({ income: 1000, cost: 600, reportedMargin: 999 })
    expect(calculatedMargin(record)).toBe(400)
    expect(computeKpis([record]).financial.margin.value).toBe(400)
  })

  it('el margen no es calculable si falta un importe', () => {
    expect(calculatedMargin(makeRecord({ income: 1000, cost: null }))).toBeNull()
    expect(calculatedMargin(makeRecord({ income: null, cost: 600 }))).toBeNull()
  })
})

describe('H05 · datos financieros incompletos', () => {
  const records = [
    makeRecord({ income: 1000, cost: 600 }),
    makeRecord({ income: 500, cost: null }),
    makeRecord({ income: null, cost: 300 }),
  ]

  it('no descarta un ingreso válido porque falte el costo, ni viceversa', () => {
    const { financial } = computeKpis(records)
    expect(financial.income).toEqual({ value: 1500, records: 2 })
    expect(financial.cost).toEqual({ value: 900, records: 2 })
  })

  it('calcula margen y porcentaje solo sobre la base con ambos importes', () => {
    const { financial } = computeKpis(records)
    expect(financial.margin).toEqual({ value: 400, records: 1 })
    expect(financial.marginIncomeBase).toBe(1000)
    expect(financial.marginPct).toBe(40)
    expect(hasIncompleteFinancials(financial)).toBe(true)
  })

  it('devuelve null (N/D) en lugar de 0 cuando no hay datos suficientes', () => {
    const { financial } = computeKpis([makeRecord({ income: null, cost: null })])
    expect(financial.income.value).toBeNull()
    expect(financial.cost.value).toBeNull()
    expect(financial.margin.value).toBeNull()
    expect(financial.marginPct).toBeNull()
    expect(computeKpis([]).financial.income.value).toBeNull()
  })

  it('no calcula porcentaje de margen si los ingresos de la base no son positivos', () => {
    expect(computeKpis([makeRecord({ income: 0, cost: 100 })]).financial.marginPct).toBeNull()
  })

  it('los gráficos usan la misma política y omiten grupos sin datos', () => {
    const groups = groupFinancials(
      [makeRecord({ zone: 'A', income: 100, cost: null }), makeRecord({ zone: 'B', income: null, cost: null })],
      'zone',
    )
    expect(groups).toEqual([
      { key: 'A', income: 100, cost: null, margin: null },
      { key: 'B', income: null, cost: null, margin: null },
    ])
  })
})

describe('H08 · números no finitos', () => {
  it('no permite que NaN o Infinity contaminen totales y porcentajes', () => {
    const { financial } = computeKpis([
      makeRecord({ income: Number.NaN, cost: 100 }),
      makeRecord({ income: Number.POSITIVE_INFINITY, cost: 100 }),
      makeRecord({ income: 1000, cost: 400 }),
    ])
    expect(financial.income).toEqual({ value: 1000, records: 1 })
    expect(financial.margin).toEqual({ value: 600, records: 1 })
    expect(ratioPercent(1, 0)).toBeNull()
    expect(ratioPercent(Number.NaN, 10)).toBeNull()
  })

  it('una suma que desborda se informa como N/D', () => {
    const { financial } = computeKpis([makeRecord({ income: Number.MAX_VALUE }), makeRecord({ income: Number.MAX_VALUE })])
    expect(financial.income.value).toBeNull()
  })
})
