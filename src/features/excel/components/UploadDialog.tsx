import { useEffect, useId } from 'react'
import { IconClose } from '../../../components/ui/icons'
import { t } from '../../../lib/i18n'
import { ImportFlow, type ImportFlowProps } from './ImportFlow'

interface UploadDialogProps extends ImportFlowProps {
  onClose: () => void
  canClose: boolean
}

/** Ventana modal para reemplazar los datos activos sin salir del dashboard. */
export function UploadDialog({ onClose, canClose, ...flowProps }: UploadDialogProps) {
  const titleId = useId()

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && canClose) onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onClose, canClose])

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-ink/40 sm:items-center sm:p-6">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-2xl bg-surface sm:rounded-2xl"
      >
        <header className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
          <div>
            <h2 id={titleId} className="text-lg font-semibold text-ink">
              {t('upload.dialogTitle')}
            </h2>
            <p className="text-sm text-ink-muted">{t('upload.dialogSubtitle')}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={!canClose}
            aria-label={t('upload.close')}
            className="rounded-lg p-1.5 text-ink-muted hover:bg-neutral-soft disabled:opacity-40"
          >
            <IconClose />
          </button>
        </header>
        <div className="overflow-y-auto p-5">
          <ImportFlow {...flowProps} />
        </div>
      </div>
    </div>
  )
}
