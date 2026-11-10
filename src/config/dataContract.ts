/**
 * Contrato de datos derivado del Excel de referencia
 * (hoja "Datos" de Datos_Sinteticos_Prueba_Tecnica_Unatrans.xlsx).
 * Nombres técnicos de columnas: NO son textos de interfaz.
 */
export const COLUMNS = {
  id: 'ID_Operacion',
  date: 'Fecha',
  zone: 'Zona',
  route: 'Ruta',
  serviceType: 'Tipo_Servicio',
  client: 'Cliente_Anonimizado',
  vehicle: 'Vehiculo_Codigo',
  kilometers: 'Kilometros',
  plannedHours: 'Horas_Planeadas',
  actualHours: 'Horas_Reales',
  status: 'Estado',
  sla: 'Cumplimiento_SLA',
  income: 'Ingresos_COP',
  cost: 'Costos_COP',
  margin: 'Margen_COP',
  rating: 'Calificacion_Servicio_1a5',
} as const

export type ColumnKey = keyof typeof COLUMNS

export const REQUIRED_COLUMNS: readonly string[] = Object.values(COLUMNS)

/** Columnas numéricas que se validan al normalizar cada fila. */
export const NUMERIC_COLUMNS = [
  'kilometers',
  'plannedHours',
  'actualHours',
  'income',
  'cost',
  'margin',
  'rating',
] as const satisfies readonly ColumnKey[]

/** Valores de Cumplimiento_SLA (normalizados sin tildes ni mayúsculas). */
export const SLA_VALUES = {
  met: ['si'],
  notMet: ['no'],
} as const

/** Tolerancia para verificar Margen_COP = Ingresos_COP − Costos_COP. */
export const MARGIN_TOLERANCE_COP = 1

export const ACCEPTED_EXTENSIONS = ['.xlsx'] as const
