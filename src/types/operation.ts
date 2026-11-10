export interface OperationRecord {
  /** Número de fila en el Excel (1-based, incluye encabezado). */
  rowNumber: number
  id: string | null
  date: Date | null
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
  margin: number | null
  rating: number | null
}

export type IssueKind = 'invalidNumber' | 'invalidDate' | 'unknownSla' | 'missingId' | 'marginMismatch'

export interface DataIssue {
  kind: IssueKind
  rowNumber: number
  column: string
  value: string
}

export interface DuplicateGroup {
  id: string
  keptRow: number
  discardedRows: number[]
}

export interface ImportPreview {
  fileName: string
  sheetName: string
  rowsRead: number
  records: OperationRecord[]
  duplicates: DuplicateGroup[]
  duplicatesDiscarded: number
  issues: DataIssue[]
  source: DatasetSource
}

export type DatasetSource = 'upload' | 'demo'

export interface Dataset {
  fileName: string
  sheetName: string
  records: OperationRecord[]
  rowsRead: number
  duplicatesDiscarded: number
  source: DatasetSource
  loadedAt: number
}

export type ImportErrorCode = 'invalidExtension' | 'unreadable' | 'missingColumns' | 'emptyFile' | 'demoUnavailable'

export interface ImportError {
  code: ImportErrorCode
  missingColumns?: string[]
  sheetName?: string
}

export type ImportOutcome = { ok: true; preview: ImportPreview } | { ok: false; error: ImportError }
