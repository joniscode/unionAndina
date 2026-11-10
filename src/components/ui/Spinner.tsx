interface SpinnerProps {
  label: string
}

/** Indicador indeterminado: no simula porcentajes de avance. */
export function Spinner({ label }: SpinnerProps) {
  return (
    <span role="status" className="inline-flex items-center">
      <span
        aria-hidden="true"
        className="size-10 animate-spin rounded-full border-4 border-brand-soft border-t-brand"
      />
      <span className="sr-only">{label}</span>
    </span>
  )
}
