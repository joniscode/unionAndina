import { Button } from '../../../components/ui/Button'
import { formatInteger } from '../../../lib/format'
import { t, type TextKey } from '../../../lib/i18n'
import { FILTER_FIELDS, type FilterField, type FilterOptions, type Filters } from '../../../types/filters'

interface FiltersBarProps {
  filters: Filters
  options: FilterOptions
  activeCount: number
  shown: number
  total: number
  onChange: (field: FilterField, value: string | null) => void
  onClear: () => void
}

const FIELD_TEXT: Record<FilterField, { label: TextKey; all: TextKey }> = {
  zone: { label: 'filters.zone', all: 'filters.allZones' },
  client: { label: 'filters.client', all: 'filters.allClients' },
  serviceType: { label: 'filters.serviceType', all: 'filters.allServices' },
  status: { label: 'filters.status', all: 'filters.allStatuses' },
}

/** Valor del <select> que representa la opción global (no es un dato del Excel). */
const ALL = ''

export function FiltersBar({ filters, options, activeCount, shown, total, onChange, onClear }: FiltersBarProps) {
  return (
    <section aria-labelledby="filters-title" className="rounded-2xl border border-line bg-surface p-4 sm:p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h2 id="filters-title" className="text-sm font-semibold text-ink">
            {t('filters.title')}
          </h2>
          {activeCount > 0 && (
            <span className="rounded-full bg-brand-soft px-2 py-0.5 text-xs font-medium text-brand-dark">
              {t('filters.activeCount', { count: activeCount })}
            </span>
          )}
        </div>
        <p className="text-sm text-ink-muted" aria-live="polite">
          {t('filters.showing', { count: formatInteger(shown), total: formatInteger(total) })}
        </p>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[repeat(4,minmax(0,1fr))_auto] lg:items-end">
        {FILTER_FIELDS.map((field) => (
          <label key={field} className="flex flex-col gap-1 text-xs font-medium text-ink-muted">
            {t(FIELD_TEXT[field].label)}
            <select
              value={filters[field] ?? ALL}
              onChange={(event) => onChange(field, event.target.value === ALL ? null : event.target.value)}
              className={`min-h-10 rounded-lg border bg-surface px-3 text-sm text-ink ${
                filters[field] === null ? 'border-line' : 'border-brand ring-1 ring-brand'
              }`}
            >
              <option value={ALL}>{t(FIELD_TEXT[field].all)}</option>
              {options[field].map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        ))}
        <Button variant="secondary" onClick={onClear} disabled={activeCount === 0}>
          {t('filters.clear')}
        </Button>
      </div>
      <p className="mt-3 text-xs text-ink-subtle">{t('filters.locationNote')}</p>
    </section>
  )
}
