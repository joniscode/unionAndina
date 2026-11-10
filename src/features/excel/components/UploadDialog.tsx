import { useEffect, useId, useRef, type KeyboardEvent, type SyntheticEvent } from 'react'
import { IconClose } from '../../../components/ui/icons'
import { t } from '../../../lib/i18n'
import { ImportFlow, type ImportFlowProps } from './ImportFlow'

const FOCUSABLE = 'button:not([disabled]), input:not([disabled]), select:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'

interface UploadDialogProps extends ImportFlowProps {
  onClose: () => void
  canClose: boolean
}

/**
 * Ventana modal accesible basada en <dialog> nativo con showModal():
 * - el resto de la página queda inerte y Tab / Shift+Tab ciclan dentro del modal;
 * - Escape cierra (salvo durante el procesamiento);
 * - el foco vuelve al control que abrió el modal al cerrarse.
 */
export function UploadDialog({ onClose, canClose, ...flowProps }: UploadDialogProps) {
  const titleId = useId()
  const descriptionId = useId()
  const dialogRef = useRef<HTMLDialogElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const stage = flowProps.flow.stage

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null
    if (!dialog.open) dialog.showModal()
    return () => {
      if (dialog.open) dialog.close()
      opener?.focus()
    }
  }, [])

  // Al cambiar de etapa el control enfocado puede desaparecer: se recoloca el foco dentro del modal.
  useEffect(() => {
    const dialog = dialogRef.current
    if (dialog && !dialog.contains(document.activeElement)) contentRef.current?.focus()
  }, [stage])

  const handleCancel = (event: SyntheticEvent<HTMLDialogElement>) => {
    event.preventDefault()
    if (canClose) onClose()
  }

  // El <dialog> nativo deja salir el foco hacia la interfaz del navegador; se cicla dentro del modal.
  const handleKeyDown = (event: KeyboardEvent<HTMLDialogElement>) => {
    if (event.key !== 'Tab') return
    const focusable = [...event.currentTarget.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((el) => !el.closest('[inert]'))
    const first = focusable[0]
    const last = focusable.at(-1)
    if (!first || !last) return
    const active = document.activeElement
    if (event.shiftKey && (active === first || !event.currentTarget.contains(active))) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && active === last) {
      event.preventDefault()
      first.focus()
    }
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      onCancel={handleCancel}
      onKeyDown={handleKeyDown}
      className="m-auto max-h-[92vh] w-[calc(100%-2rem)] max-w-3xl overflow-hidden rounded-2xl bg-surface p-0 text-ink backdrop:bg-ink/40"
    >
      <div className="flex max-h-[92vh] flex-col">
        <header className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
          <div>
            <h2 id={titleId} className="text-lg font-semibold text-ink">
              {t('upload.dialogTitle')}
            </h2>
            <p id={descriptionId} className="text-sm text-ink-muted">
              {t('upload.dialogSubtitle')}
            </p>
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
        <div ref={contentRef} tabIndex={-1} className="overflow-y-auto p-5 outline-none">
          <ImportFlow {...flowProps} />
        </div>
      </div>
    </dialog>
  )
}
