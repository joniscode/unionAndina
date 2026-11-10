import { useMemo, useState, type ReactNode } from 'react'
import { Badge } from '../../../components/ui/Badge'
import { EmptyState } from '../../../components/ui/EmptyState'
import { IconSearch, IconWarning } from '../../../components/ui/icons'
import { Panel } from '../../../components/ui/Panel'
import { APP_CONFIG } from '../../../config/app'
import { MARGIN_TOLERANCE_COP } from '../../../config/dataContract'
import { toneForSla, toneForStatus } from '../../../config/statusTones'
import { searchById } from '../../../lib/filters'
import { formatIsoDate } from '../../../lib/dates'
import { formatCurrency, formatInteger } from '../../../lib/format'
import { calculatedMargin } from '../../../lib/metrics'
import { t, type TextKey } from '../../../lib/i18n'
import type { OperationRecord } from '../../../types/operation'
import { Pagination } from './Pagination'

interface RecordsTableProps {
  records: readonly OperationRecord[]
}

const EMPTY = t('table.emptyCell')

const text = (value: string | null): string => value ?? EMPTY
const money = (value: number | null): string => (value === null ? EMPTY : formatCurrency(value))

/**
 * Muestra el margen calculado (Ingresos − Costos), el mismo criterio de los indicadores.
 * Si el Margen_COP informado difiere, se señala con icono y texto accesible.
 */
function MarginCell({ record }: { record: OperationRecord }) {
  const margin = calculatedMargin(record)
  if (margin === null) {
    return <span title={t('table.marginUnavailable')} aria-label={t('table.marginUnavailable')}>{EMPTY}</span>
  }
  const reported = record.reportedMargin
  const differs = reported !== null && Math.abs(reported - margin) > MARGIN_TOLERANCE_COP
  const label = differs ? t('table.marginMismatchLabel', { value: formatCurrency(reported) }) : undefined
  return (
    <span className={`inline-flex items-center gap-1 ${margin < 0 ? 'text-danger' : ''}`} title={label}>
      {differs && <IconWarning width={14} height={14} className="text-warning" aria-hidden="true" />}
      {formatCurrency(margin)}
      {label && <span className="sr-only">. {label}</span>}
    </span>
  )
}

interface Column {
  label: TextKey
  numeric?: boolean
  render: (record: OperationRecord) => ReactNode
}

const COLUMNS: Column[] = [
  { label: 'table.columns.id', render: (r) => <span className="font-semibold text-ink">{text(r.id)}</span> },
  { label: 'table.columns.date', render: (r) => (r.date ? formatIsoDate(r.date) : EMPTY) },
  { label: 'table.columns.zone', render: (r) => text(r.zone) },
  { label: 'table.columns.route', render: (r) => text(r.route) },
  { label: 'table.columns.client', render: (r) => text(r.client) },
  { label: 'table.columns.serviceType', render: (r) => text(r.serviceType) },
  {
    label: 'table.columns.status',
    render: (r) => (r.status ? <Badge tone={toneForStatus(r.status)}>{r.status}</Badge> : EMPTY),
  },
  {
    label: 'table.columns.sla',
    render: (r) => (r.slaRaw ? <Badge tone={toneForSla(r.slaMet)}>{r.slaRaw}</Badge> : EMPTY),
  },
  { label: 'table.columns.income', numeric: true, render: (r) => money(r.income) },
  { label: 'table.columns.cost', numeric: true, render: (r) => money(r.cost) },
  {
    label: 'table.columns.margin',
    numeric: true,
    render: (r) => <MarginCell record={r} />,
  },
]

export function RecordsTable({ records }: RecordsTableProps) {
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)

  const matches = useMemo(() => searchById(records, query), [records, query])
  const pages = Math.max(1, Math.ceil(matches.length / APP_CONFIG.pageSize))
  const currentPage = Math.min(page, pages)
  const start = (currentPage - 1) * APP_CONFIG.pageSize
  const visible = matches.slice(start, start + APP_CONFIG.pageSize)

  const search = (
    <label className="relative block w-full sm:w-64">
      <span className="sr-only">{t('table.searchLabel')}</span>
      <IconSearch className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ink-subtle" width={16} height={16} />
      <input
        type="search"
        value={query}
        placeholder={t('table.searchPlaceholder')}
        onChange={(event) => {
          setQuery(event.target.value)
          setPage(1)
        }}
        className="min-h-10 w-full rounded-lg border border-line bg-surface pr-3 pl-9 text-sm placeholder:text-ink-subtle"
      />
    </label>
  )

  return (
    <Panel title={t('table.title')} subtitle={t('table.subtitle')} actions={search}>
      {matches.length === 0 ? (
        <EmptyState title={t('table.empty')} />
      ) : (
        <>
          <div className="-mx-4 overflow-x-auto sm:mx-0">
            <table className="w-full min-w-[960px] text-left text-sm">
              <thead>
                <tr className="border-b border-line text-xs uppercase tracking-wide text-ink-muted">
                  {COLUMNS.map((column) => (
                    <th key={column.label} scope="col" className={`px-2.5 py-2.5 font-semibold ${column.numeric ? 'text-right' : ''}`}>
                      {t(column.label)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {visible.map((record) => (
                  <tr key={record.rowNumber} className="text-ink-muted hover:bg-canvas">
                    {COLUMNS.map((column) => (
                      <td
                        key={column.label}
                        className={`px-2.5 py-2.5 whitespace-nowrap ${column.numeric ? 'text-right tabular-nums text-ink' : ''}`}
                      >
                        {column.render(record)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
            <p className="text-sm text-ink-muted">{t('table.resultsCount', { count: formatInteger(matches.length) })}</p>
            <Pagination page={currentPage} pages={pages} onChange={setPage} />
          </div>
        </>
      )}
    </Panel>
  )
}
