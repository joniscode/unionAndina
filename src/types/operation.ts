import type { IssueSeverity } from '../config/dataContract'

export interface OperationRecord {
  /** Número de fila en el Excel (1-based, incluye encabezado). */
  rowNumber: number
  id: string | null
  /** Fecha de calendario normalizada "AAAA-MM-DD" (sin zona horaria). */
  date: string | null
  zone: string | null
  route: string | null
  serviceType: string | null
  client: string | null
  vehicle: string | null
  kilometers: number | null
  plannedHours: number | null
  actualHours: number | null
  status: string | null
  /** true = "Sí", false = "No", null = vacío o no reconocido. */
  slaMet: boolean | null
  slaRaw: string | null
  income: number | null
  cost: number | null
  /** Margen_COP tal como viene en el Excel. El margen de análisis se calcula (ver lib/metrics). */
  reportedMargin: number | null
  rating: number | null
}

export type IssueKind = 'missingId' | 'missingRequired' | 'invalidNumber' | 'invalidDate' | 'unknownSla' | 'marginMismatch'

export interface DataIssue {
  severity: IssueSeverity
  kind: IssueKind
  sheetName: string
  rowNumber: number
  column: string
  /** Valor original de la celda (texto). */
  value: string
  /** Dato adicional para el mensaje (p. ej. margen calculado). */
  expected?: string
}

export interface DuplicateGroup {
  id: string
  keptRow: number
  discardedRows: number[]
  /** Filas descartadas cuyo contenido difiere de la fila conservada. */
  conflictingRows: number[]
}

export interface ImportSummary {
  /** Filas con contenido leídas de la hoja. */
  rowsRead: number
  /** Duplicados descartados (apariciones posteriores del mismo ID). */
  duplicatesDiscarded: number
  /** Registros tras deduplicar (incluye los excluidos por error). */
  uniqueRecords: number
  /** Registros únicos sin ninguna incidencia. */
  cleanRecords: number
  /** Registros únicos con al menos una incidencia (se cuentan una sola vez). */
  recordsWithIssues: number
  /** Registros con error, excluidos de todos los cálculos. */
  excludedRecords: number
  /** Registros que alimentan el dashboard. */
  usableRecords: number
  warnings: number
  errors: number
}

export interface ImportPreview {
  fileName: string
  sheetName: string
  /** Registros utilizables (únicos y sin errores). */
  records: OperationRecord[]
  duplicates: DuplicateGroup[]
  issues: DataIssue[]
  summary: ImportSummary
  source: DatasetSource
}

export type DatasetSource = 'upload' | 'demo'

export interface Dataset {
  fileName: string
  sheetName: string
  records: OperationRecord[]
  summary: ImportSummary
  source: DatasetSource
  loadedAt: number
}

export type ImportErrorCode =
  | 'invalidExtension'
  | 'fileTooLarge'
  | 'tooManyRecords'
  | 'unreadable'
  | 'missingColumns'
  | 'emptyFile'
  | 'noUsableRecords'
  | 'demoUnavailable'

export interface ImportError {
  code: ImportErrorCode
  missingColumns?: string[]
  sheetName?: string
}

export type ImportOutcome = { ok: true; preview: ImportPreview } | { ok: false; error: ImportError }
