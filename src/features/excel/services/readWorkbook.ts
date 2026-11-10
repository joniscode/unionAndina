import { read, utils } from 'xlsx'

export interface RawSheet {
  name: string
  /** Número de fila (1-based) del encabezado dentro del Excel. */
  headerRowNumber: number
  /** Filas crudas; la posición 0 es el encabezado. Incluye filas vacías para conservar la numeración. */
  rows: unknown[][]
  /** Filas de datos declaradas por la hoja (sin encabezado), aunque no se hayan leído todas. */
  declaredDataRows: number
}

export interface RawWorkbook {
  /** Sistema de fechas del libro: true = 1904 (Mac antiguo), false = 1900. */
  date1904: boolean
  sheets: RawSheet[]
}

export interface ReadOptions {
  /** Máximo de filas de datos a leer por hoja; protege memoria y tiempo de procesamiento. */
  maxDataRows: number
}

/**
 * Lee un libro .xlsx desde memoria (ArrayBuffer), sin depender del DOM ni de React.
 * Las fechas se reciben como números de serie (cellDates: false) para convertirlas
 * sin zona horaria en lib/dates. Lanza un error si el contenido no puede interpretarse.
 */
export function readWorkbook(data: ArrayBuffer, { maxDataRows }: ReadOptions): RawWorkbook {
  const workbook = read(data, { type: 'array', cellDates: false, sheetRows: maxDataRows + 1 })
  const sheets = workbook.SheetNames.map((name): RawSheet => {
    const sheet = workbook.Sheets[name]
    const ref = sheet?.['!ref']
    if (!sheet || !ref) return { name, headerRowNumber: 1, rows: [], declaredDataRows: 0 }
    const range = utils.decode_range(ref)
    // Con sheetRows, SheetJS conserva el rango completo en "!fullref".
    const full = utils.decode_range(sheet['!fullref'] ?? ref)
    const rows = utils.sheet_to_json<unknown[]>(sheet, { header: 1, defval: null, blankrows: true, raw: true })
    return { name, headerRowNumber: range.s.r + 1, rows, declaredDataRows: full.e.r - full.s.r }
  })
  return { date1904: Boolean(workbook.Workbook?.WBProps?.date1904), sheets }
}
