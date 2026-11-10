import type { Dataset, ImportError, ImportOutcome, ImportPreview } from '../../../types/operation'

/** Etapas reales del flujo de importación (sin porcentajes simulados). */
export type FlowState =
  | { stage: 'idle' }
  | { stage: 'reading'; fileName: string; requestId: number }
  | { stage: 'validating'; fileName: string; requestId: number }
  | { stage: 'review'; preview: ImportPreview }
  | { stage: 'applying'; preview: ImportPreview }
  | { stage: 'success'; fileName: string; operations: number }
  | { stage: 'error'; fileName: string; error: ImportError }

export interface ImportState {
  /** Datos confirmados que alimentan el dashboard. Solo cambian al confirmar. */
  active: Dataset | null
  /** Archivo en proceso (pendiente de confirmación). */
  flow: FlowState
}

export type ImportAction =
  | { type: 'start'; fileName: string; requestId: number }
  | { type: 'read'; requestId: number }
  | { type: 'processed'; requestId: number; outcome: ImportOutcome }
  | { type: 'confirm' }
  | { type: 'applied'; loadedAt: number }
  | { type: 'cancel' }
  | { type: 'dismiss' }
  | { type: 'reset' }

export const initialImportState: ImportState = { active: null, flow: { stage: 'idle' } }

export function toDataset(preview: ImportPreview, loadedAt: number): Dataset {
  return {
    fileName: preview.fileName,
    sheetName: preview.sheetName,
    records: preview.records,
    summary: preview.summary,
    source: preview.source,
    loadedAt,
  }
}

function isCurrentRequest(flow: FlowState, requestId: number): flow is Extract<FlowState, { requestId: number }> {
  return (flow.stage === 'reading' || flow.stage === 'validating') && flow.requestId === requestId
}

export function isProcessing(flow: FlowState): boolean {
  return flow.stage === 'reading' || flow.stage === 'validating' || flow.stage === 'applying'
}

export function importReducer(state: ImportState, action: ImportAction): ImportState {
  const { flow } = state
  switch (action.type) {
    case 'start':
      if (isProcessing(flow)) return state
      return { ...state, flow: { stage: 'reading', fileName: action.fileName, requestId: action.requestId } }
    case 'read':
      if (!isCurrentRequest(flow, action.requestId)) return state
      return { ...state, flow: { ...flow, stage: 'validating' } }
    case 'processed':
      if (!isCurrentRequest(flow, action.requestId)) return state
      return {
        ...state,
        flow: action.outcome.ok
          ? { stage: 'review', preview: action.outcome.preview }
          : { stage: 'error', fileName: flow.fileName, error: action.outcome.error },
      }
    case 'confirm':
      // Solo desde revisión: evita confirmaciones duplicadas.
      if (flow.stage !== 'review') return state
      return { ...state, flow: { stage: 'applying', preview: flow.preview } }
    case 'applied':
      if (flow.stage !== 'applying') return state
      // Reemplazo completo: los datos anteriores no se combinan con los nuevos.
      return {
        active: toDataset(flow.preview, action.loadedAt),
        flow: { stage: 'success', fileName: flow.preview.fileName, operations: flow.preview.records.length },
      }
    case 'cancel':
      if (flow.stage === 'applying') return state
      return { ...state, flow: { stage: 'idle' } }
    case 'dismiss':
      if (flow.stage !== 'success' && flow.stage !== 'error') return state
      return { ...state, flow: { stage: 'idle' } }
    case 'reset':
      // Volver al inicio: descarta los datos activos (no hay persistencia por diseño).
      if (isProcessing(flow)) return state
      return initialImportState
  }
}
