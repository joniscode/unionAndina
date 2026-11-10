import type { ReactNode } from 'react'

interface KpiCardProps {
  label: string
  value: string
  hint: string
  accent: string
  valueClassName?: string
  children?: ReactNode
}

export function KpiCard({ label, value, hint, accent, valueClassName = 'text-ink', children }: KpiCardProps) {
  return (
    <article className="relative flex flex-col gap-1 overflow-hidden rounded-2xl border border-line bg-surface p-4 sm:p-5">
      <span aria-hidden="true" className={`absolute inset-y-0 left-0 w-1 ${accent}`} />
      <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-muted">{label}</h3>
      <p className={`text-2xl font-bold tabular-nums tracking-tight xl:text-[1.6rem] ${valueClassName}`}>{value}</p>
      {children}
      <p className="text-xs text-ink-muted">{hint}</p>
    </article>
  )
}
