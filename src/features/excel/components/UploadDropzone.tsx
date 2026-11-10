import { useId, useState, type ChangeEvent, type DragEvent } from 'react'
import { Button } from '../../../components/ui/Button'
import { IconFile, IconUpload } from '../../../components/ui/icons'
import { ACCEPTED_EXTENSIONS } from '../../../config/dataContract'
import { t } from '../../../lib/i18n'

interface UploadDropzoneProps {
  onFile: (file: File) => void
  onDemo: () => void
  disabled?: boolean
}

export function UploadDropzone({ onFile, onDemo, disabled = false }: UploadDropzoneProps) {
  const inputId = useId()
  const [dragging, setDragging] = useState(false)

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    // Se limpia el input para permitir volver a seleccionar el mismo archivo.
    event.target.value = ''
    if (file) onFile(file)
  }

  const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault()
    setDragging(false)
    const file = event.dataTransfer.files[0]
    if (file && !disabled) onFile(file)
  }

  const handleDragOver = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault()
    if (!disabled) setDragging(true)
  }

  return (
    <div className="flex flex-col gap-4">
      <label
        htmlFor={inputId}
        onDragOver={handleDragOver}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`flex cursor-pointer flex-col items-center gap-3 rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-colors ${
          dragging ? 'border-brand bg-brand-soft' : 'border-line bg-canvas/60 hover:border-brand/60'
        }`}
      >
        <span className="flex size-14 items-center justify-center rounded-full bg-brand-soft text-brand-dark">
          <IconUpload width={26} height={26} />
        </span>
        <span className="text-base font-semibold text-ink">{t('upload.dropzoneTitle')}</span>
        <span className="text-sm text-ink-muted">{t('upload.dropzoneOr')}</span>
        <span className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-brand px-4 text-sm font-semibold text-white hover:bg-brand-dark">
          <IconFile width={18} height={18} />
          {t('upload.selectFile')}
        </span>
        <span className="text-xs text-ink-subtle">{t('upload.acceptedFormat')}</span>
        <input
          id={inputId}
          type="file"
          accept={ACCEPTED_EXTENSIONS.join(',')}
          aria-label={t('upload.inputLabel')}
          className="sr-only"
          disabled={disabled}
          onChange={handleChange}
        />
      </label>
      <div className="flex flex-col items-center gap-1 text-center">
        <Button variant="ghost" onClick={onDemo} disabled={disabled}>
          {t('upload.useDemo')}
        </Button>
        <p className="text-xs text-ink-subtle">{t('upload.demoHint')}</p>
      </div>
    </div>
  )
}
