import type { ComponentType, SVGProps } from 'react'
import type { Tone } from '../../config/statusTones'
import type { TextKey } from '../../lib/i18n'
import { IconCheck, IconError, IconInfo, IconMinus, IconWarning } from './icons'

interface ToneStyle {
  soft: string
  strong: string
  Icon: ComponentType<SVGProps<SVGSVGElement>>
  /** Texto accesible que acompaña al color. */
  label: TextKey
}

export const TONE_STYLES: Record<Tone, ToneStyle> = {
  success: { soft: 'bg-success-soft border-success/25', strong: 'text-success', Icon: IconCheck, label: 'a11y.success' },
  warning: { soft: 'bg-warning-soft border-warning/25', strong: 'text-warning', Icon: IconWarning, label: 'a11y.warning' },
  danger: { soft: 'bg-danger-soft border-danger/25', strong: 'text-danger', Icon: IconError, label: 'a11y.error' },
  info: { soft: 'bg-info-soft border-info/25', strong: 'text-info', Icon: IconInfo, label: 'a11y.info' },
  neutral: { soft: 'bg-neutral-soft border-neutral/20', strong: 'text-neutral', Icon: IconMinus, label: 'a11y.info' },
}
