import { useCallback, useEffect, useReducer, useRef } from 'react'
import { APP_CONFIG } from '../../../config/app'
import type { DatasetSource, ImportOutcome } from '../../../types/operation'
import type { ImportErrorCode } from '../../../types/operation'
import { exceedsFileSize, hasAcceptedExtension } from '../validators/validateStructure'
import { importReducer, initialImportState } from './importReducer'

/** Cede el hilo principal para que el indicador de carga se pinte antes del procesamiento. */
const yieldToBrowser = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 0))

async function fetchDemo(): Promise<ArrayBuffer> {
  const response = await fetch(`${import.meta.env.BASE_URL}${APP_CONFIG.demoFilePath}`)
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  return response.arrayBuffer()
}

export function useExcelImport() {
  const [state, dispatch] = useReducer(importReducer, initialImportState)
  const requestCounter = useRef(0)

  const run = useCallback(async (fileName: string, source: DatasetSource, load: () => Promise<ArrayBuffer>) => {
    const requestId = ++requestCounter.current
    dispatch({ type: 'start', fileName, requestId })
    let outcome: ImportOutcome
    try {
      // El lector de Excel (SheetJS) se descarga solo cuando se procesa un archivo.
      const [data, { processWorkbook }] = await Promise.all([load(), import('../services/processWorkbook')])
      dispatch({ type: 'read', requestId })
      await yieldToBrowser()
      outcome = processWorkbook(data, fileName, { source })
    } catch {
      outcome = { ok: false, error: { code: source === 'demo' ? 'demoUnavailable' : 'unreadable' } }
    }
    dispatch({ type: 'processed', requestId, outcome })
  }, [])

  const importFile = useCallback(
    (file: File) => {
      // Validaciones previas a la lectura: evitan cargar en memoria archivos no admitidos.
      const precheck: ImportErrorCode | null = !hasAcceptedExtension(file.name)
        ? 'invalidExtension'
        : exceedsFileSize(file.size)
          ? 'fileTooLarge'
          : null
      if (precheck) {
        const requestId = ++requestCounter.current
        dispatch({ type: 'start', fileName: file.name, requestId })
        dispatch({ type: 'processed', requestId, outcome: { ok: false, error: { code: precheck } } })
        return
      }
      void run(file.name, 'upload', () => file.arrayBuffer())
    },
    [run],
  )

  const importDemo = useCallback(() => {
    void run(APP_CONFIG.demoFileName, 'demo', fetchDemo)
  }, [run])

  const confirm = useCallback(() => dispatch({ type: 'confirm' }), [])
  const cancel = useCallback(() => dispatch({ type: 'cancel' }), [])
  const dismiss = useCallback(() => dispatch({ type: 'dismiss' }), [])
  const reset = useCallback(() => dispatch({ type: 'reset' }), [])

  // Etapa "applying": se muestra el loader y en el siguiente ciclo se activan los datos.
  useEffect(() => {
    if (state.flow.stage !== 'applying') return
    const timer = setTimeout(() => dispatch({ type: 'applied', loadedAt: Date.now() }), 0)
    return () => clearTimeout(timer)
  }, [state.flow.stage])

  return { active: state.active, flow: state.flow, importFile, importDemo, confirm, cancel, dismiss, reset }
}
