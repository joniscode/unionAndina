import type { Tone } from '../../config/statusTones'
import { TONE_STYLES } from './tones'

interface BadgeProps {
  tone: Tone
  children: string
}

/** Etiqueta de estado: color + icono + texto real del archivo. */
export function Badge({ tone, children }: BadgeProps) {
  const { soft, strong, Icon } = TONE_STYLES[tone]
  return (
    <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2 py-0.5 text-xs font-medium ${soft} ${strong}`}>
      <Icon width={13} height={13} strokeWidth={2.2} />
      {children}
    </span>
  )
}
