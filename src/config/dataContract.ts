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
  reportedMargin: 'Margen_COP',
  rating: 'Calificacion_Servicio_1a5',
} as const

export type ColumnKey = keyof typeof COLUMNS

/** Las 16 columnas deben existir en la hoja de datos (validación de estructura). */
export const REQUIRED_COLUMNS: readonly string[] = Object.values(COLUMNS)

export type FieldType = 'id' | 'text' | 'number' | 'date' | 'sla'

/**
 * Severidad cuando el campo está vacío o es inválido:
 * - error: el registro no puede utilizarse y se excluye de todos los cálculos.
 * - warning: el registro se utiliza; el valor afectado se omite solo en su cálculo.
 */
export type IssueSeverity = 'error' | 'warning'

export interface FieldRule {
  type: FieldType
  /** Obligatorio: un valor vacío genera incidencia. Opcional: solo se reportan valores inválidos. */
  required: boolean
  severity: IssueSeverity
}

/**
 * Política de validación por campo.
 * ID_Operacion es el identificador único de la operación según la hoja "Diccionario";
 * sin él no es posible deduplicar ni rastrear el registro, por eso su ausencia es un error.
 */
export const FIELD_RULES: Record<ColumnKey, FieldRule> = {
  id: { type: 'id', required: true, severity: 'error' },
  date: { type: 'date', required: true, severity: 'warning' },
  zone: { type: 'text', required: true, severity: 'warning' },
  route: { type: 'text', required: false, severity: 'warning' },
  serviceType: { type: 'text', required: true, severity: 'warning' },
  client: { type: 'text', required: true, severity: 'warning' },
  vehicle: { type: 'text', required: false, severity: 'warning' },
  kilometers: { type: 'number', required: false, severity: 'warning' },
  plannedHours: { type: 'number', required: false, severity: 'warning' },
  actualHours: { type: 'number', required: false, severity: 'warning' },
  status: { type: 'text', required: true, severity: 'warning' },
  sla: { type: 'sla', required: true, severity: 'warning' },
  income: { type: 'number', required: true, severity: 'warning' },
  cost: { type: 'number', required: true, severity: 'warning' },
  reportedMargin: { type: 'number', required: true, severity: 'warning' },
  rating: { type: 'number', required: false, severity: 'warning' },
}

/** Valores de Cumplimiento_SLA (normalizados sin tildes ni mayúsculas). */
export const SLA_VALUES = {
  met: ['si'],
  notMet: ['no'],
} as const

/** Tolerancia para verificar Margen_COP = Ingresos_COP − Costos_COP. */
export const MARGIN_TOLERANCE_COP = 1

export const ACCEPTED_EXTENSIONS = ['.xlsx'] as const

/**
 * Límites de importación (ver README, sección "Límites").
 * Medido con SheetJS: ~2 s para 10.000 filas en el hilo principal; por encima la
 * interfaz se bloquea varios segundos, por lo que se rechaza el archivo con un mensaje claro.
 */
export const IMPORT_LIMITS = {
  maxFileBytes: 5 * 1024 * 1024,
  maxRecords: 10_000,
} as const
