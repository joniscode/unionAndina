import type { ReactNode } from 'react'
import type { Tone } from '../../config/statusTones'
import { t } from '../../lib/i18n'
import { IconClose } from './icons'
import { TONE_STYLES } from './tones'

interface AlertProps {
  tone: Exclude<Tone, 'neutral'>
  title?: string
  children?: ReactNode
  onDismiss?: () => void
  dismissLabel?: string
}

/** Mensaje con color, icono y texto: el estado nunca depende solo del color. */
export function Alert({ tone, title, children, onDismiss, dismissLabel }: AlertProps) {
  const { soft, strong, Icon, label } = TONE_STYLES[tone]
  const urgent = tone === 'danger'
  return (
    <div role={urgent ? 'alert' : 'status'} className={`flex gap-3 rounded-xl border p-4 ${soft}`}>
      <Icon className={`mt-0.5 shrink-0 ${strong}`} />
      <div className="min-w-0 flex-1 text-sm">
        <span className="sr-only">{t(label)}: </span>
        {title && <p className={`font-semibold ${strong}`}>{title}</p>}
        {children && <div className="mt-1 text-ink">{children}</div>}
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label={dismissLabel}
          className="shrink-0 self-start rounded-md p-1 text-ink-muted hover:bg-surface/70"
        >
          <IconClose width={16} height={16} />
        </button>
      )}
    </div>
  )
}
