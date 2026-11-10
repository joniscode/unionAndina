import type { FlowState } from '../hooks/importReducer'
import { ImportErrorPanel } from './ImportErrorPanel'
import { ImportProgress } from './ImportProgress'
import { ImportReview } from './ImportReview'
import { UploadDropzone } from './UploadDropzone'

export interface ImportFlowProps {
  flow: FlowState
  hasActiveData: boolean
  onFile: (file: File) => void
  onDemo: () => void
  onConfirm: () => void
  onCancel: () => void
}

/** Renderiza la vista adecuada para cada etapa del flujo de importación. */
export function ImportFlow({ flow, hasActiveData, onFile, onDemo, onConfirm, onCancel }: ImportFlowProps) {
  switch (flow.stage) {
    case 'reading':
    case 'validating':
      return <ImportProgress stage={flow.stage} fileName={flow.fileName} />
    case 'applying':
      return <ImportProgress stage="applying" fileName={flow.preview.fileName} />
    case 'review':
      return (
        <ImportReview
          preview={flow.preview}
          hasActiveData={hasActiveData}
          onConfirm={onConfirm}
          onCancel={onCancel}
        />
      )
    case 'error':
      return <ImportErrorPanel fileName={flow.fileName} error={flow.error} hasActiveData={hasActiveData} onRetry={onCancel} />
    case 'idle':
    case 'success':
      return <UploadDropzone onFile={onFile} onDemo={onDemo} />
  }
}
