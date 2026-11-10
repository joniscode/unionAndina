import { normalizeKey } from '../lib/parse'

export type Tone = 'success' | 'warning' | 'danger' | 'info' | 'neutral'

/**
 * Tono visual para estados conocidos del archivo de referencia.
 * Es solo presentación: los estados y filtros siempre salen de los datos;
 * cualquier estado no listado se muestra con tono neutro.
 */
const STATUS_TONES: Record<string, Tone> = {
  completado: 'success',
  'con novedad': 'warning',
  cancelado: 'danger',
}

export function toneForStatus(status: string | null): Tone {
  if (status === null) return 'neutral'
  return STATUS_TONES[normalizeKey(status)] ?? 'neutral'
}

export function toneForSla(slaMet: boolean | null): Tone {
  if (slaMet === null) return 'neutral'
  return slaMet ? 'success' : 'danger'
}
