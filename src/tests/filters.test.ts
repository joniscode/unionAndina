import { describe, expect, it } from 'vitest'
import { applyFilters, buildFilterOptions, countActiveFilters, EMPTY_FILTERS, searchById } from '../lib/filters'
import { computeKpis } from '../lib/metrics'
import { makeRecord, previewOf, readDemoFile } from './helpers'

const records = [
  makeRecord({ id: 'OP-1', zone: 'Bogotá', client: 'Cliente A', serviceType: 'Carga general', status: 'Completado', income: 100 }),
  makeRecord({ id: 'OP-2', zone: 'Bogotá', client: 'Cliente B', serviceType: 'Recolección', status: 'Cancelado', income: 200 }),
  makeRecord({ id: 'OP-3', zone: 'Antioquia', client: 'Cliente A', serviceType: 'Carga general', status: 'Completado', income: 300 }),
  makeRecord({ id: 'OP-4', zone: null, client: null, serviceType: null, status: null, income: 400 }),
]

describe('aplicación de filtros', () => {
  it('genera las opciones dinámicamente desde los datos, sin vacíos y ordenadas', () => {
    expect(buildFilterOptions(records)).toEqual({
      zone: ['Antioquia', 'Bogotá'],
      client: ['Cliente A', 'Cliente B'],
      serviceType: ['Carga general', 'Recolección'],
      status: ['Cancelado', 'Completado'],
    })
  })

  it('las opciones del archivo de referencia provienen del Excel', () => {
    const options = buildFilterOptions(previewOf(readDemoFile()).records)
    expect(options.zone).toEqual(['Antioquia', 'Bogotá', 'Costa Caribe', 'Eje Cafetero', 'Santander', 'Valle del Cauca'])
    expect(options.client).toHaveLength(6)
    expect(options.status).toEqual(['Cancelado', 'Completado', 'Con novedad'])
  })

  it('sin filtros devuelve todos los registros', () => {
    expect(applyFilters(records, EMPTY_FILTERS)).toHaveLength(4)
  })

  it('filtrar por cliente recalcula los indicadores solo con sus operaciones', () => {
    const filtered = applyFilters(records, { ...EMPTY_FILTERS, client: 'Cliente A' })
    expect(filtered.map((r) => r.id)).toEqual(['OP-1', 'OP-3'])
    expect(computeKpis(filtered).financial.income).toBe(400)
  })

  it('filtrar por zona muestra únicamente sus registros', () => {
    const filtered = applyFilters(records, { ...EMPTY_FILTERS, zone: 'Bogotá' })
    expect(filtered.every((r) => r.zone === 'Bogotá')).toBe(true)
    expect(filtered).toHaveLength(2)
  })

  it('combina filtros (AND)', () => {
    const filters = { zone: 'Bogotá', client: 'Cliente A', serviceType: 'Carga general', status: 'Completado' }
    expect(applyFilters(records, filters).map((r) => r.id)).toEqual(['OP-1'])
    expect(countActiveFilters(filters)).toBe(4)
    expect(applyFilters(records, { ...filters, status: 'Cancelado' })).toEqual([])
  })

  it('busca por identificador sin distinguir mayúsculas', () => {
    expect(searchById(records, 'op-3').map((r) => r.id)).toEqual(['OP-3'])
    expect(searchById(records, '  ')).toHaveLength(4)
  })
})
