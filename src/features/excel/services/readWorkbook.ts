import { read, utils } from 'xlsx'

export interface RawSheet {
  name: string
  /** Número de fila (1-based) del encabezado dentro del Excel. */
  headerRowNumber: number
  /** Filas crudas; la posición 0 es el encabezado. Incluye filas vacías para conservar la numeración. */
  rows: unknown[][]
}

/**
 * Lee un libro .xlsx desde memoria (ArrayBuffer), sin depender del DOM ni de React.
 * Lanza un error si el contenido no puede interpretarse.
 */
export function readWorkbook(data: ArrayBuffer): RawSheet[] {
  const workbook = read(data, { type: 'array', cellDates: true })
  return workbook.SheetNames.map((name) => {
    const sheet = workbook.Sheets[name]
    const ref = sheet?.['!ref']
    if (!sheet || !ref) return { name, headerRowNumber: 1, rows: [] }
    const range = utils.decode_range(ref)
    const rows = utils.sheet_to_json<unknown[]>(sheet, { header: 1, defval: null, blankrows: true, raw: true })
    return { name, headerRowNumber: range.s.r + 1, rows }
  })
}
