import { Spinner } from '../../../components/ui/Spinner'
import { t, type TextKey } from '../../../lib/i18n'

export type ProgressStage = 'reading' | 'validating' | 'applying'

const STAGE_TEXT: Record<ProgressStage, TextKey> = {
  reading: 'stages.reading',
  validating: 'stages.validating',
  applying: 'stages.applying',
}

const STAGE_ORDER: readonly ProgressStage[] = ['reading', 'validating', 'applying']

interface ImportProgressProps {
  stage: ProgressStage
  fileName: string
}

/** Muestra la etapa real en curso con un indicador indeterminado. */
export function ImportProgress({ stage, fileName }: ImportProgressProps) {
  const current = STAGE_ORDER.indexOf(stage)
  return (
    <div className="flex flex-col items-center gap-4 py-10 text-center" aria-busy="true">
      <Spinner label={t('a11y.loading')} />
      <p className="text-base font-semibold text-ink" aria-live="polite">
        {t(STAGE_TEXT[stage])}
      </p>
      <p className="max-w-full truncate text-sm text-ink-muted">{t('stages.fileName', { fileName })}</p>
      <ol className="flex gap-2" aria-hidden="true">
        {STAGE_ORDER.map((item, index) => (
          <li key={item} className={`h-1.5 w-10 rounded-full ${index <= current ? 'bg-brand' : 'bg-line'}`} />
        ))}
      </ol>
    </div>
  )
}
