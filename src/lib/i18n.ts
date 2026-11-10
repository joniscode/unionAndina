import texts from '../config/texts.json'

type Texts = typeof texts

type LeafKeys<T, Prefix extends string = ''> = {
  [K in keyof T & string]: T[K] extends string ? `${Prefix}${K}` : LeafKeys<T[K], `${Prefix}${K}.`>
}[keyof T & string]

export type TextKey = LeafKeys<Texts>
export type TextParams = Record<string, string | number>

function lookup(key: string): string {
  let node: unknown = texts
  for (const part of key.split('.')) {
    node = typeof node === 'object' && node !== null ? (node as Record<string, unknown>)[part] : undefined
  }
  return typeof node === 'string' ? node : key
}

/** Devuelve un texto de config/texts.json e interpola parámetros {nombre}. */
export function t(key: TextKey, params?: TextParams): string {
  const template = lookup(key)
  if (!params) return template
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in params ? String(params[name]) : match,
  )
}
