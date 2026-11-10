import { formatCurrency, formatInteger, formatPercent } from '../../../lib/format'
import { t, type TextKey } from '../../../lib/i18n'
import type { AmountTotal, Kpis } from '../../../lib/metrics'
import { KpiCard } from './KpiCard'

interface KpiGridProps {
  kpis: Kpis
  totalRecords: number
}

const NOT_AVAILABLE = t('dashboard.notAvailable')

const money = (amount: AmountTotal): string => (amount.value === null ? NOT_AVAILABLE : formatCurrency(amount.value))

/** Aviso de base parcial: solo cuando el total no incluye todas las operaciones filtradas. */
function baseNote(amount: AmountTotal, operations: number, key: TextKey = 'dashboard.basePartial'): string | undefined {
  if (amount.records === operations || amount.records === 0) return undefined
  return t(key, { count: formatInteger(amount.records), total: formatInteger(operations) })
}

export function KpiGrid({ kpis, totalRecords }: KpiGridProps) {
  const { financial, sla, totalOperations } = kpis
  const { income, cost, margin, marginPct } = financial

  const marginHint =
    margin.value === null
      ? t('dashboard.marginNoData')
      : marginPct === null
        ? t('dashboard.marginPctUnavailable')
        : t('dashboard.marginHint', { pct: formatPercent(marginPct) })

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      <KpiCard
        label={t('dashboard.totalOperations')}
        value={formatInteger(totalOperations)}
        hint={t('dashboard.totalOperationsHint', { total: formatInteger(totalRecords) })}
        accent="bg-brand-dark"
      />
      <KpiCard
        label={t('dashboard.income')}
        value={money(income)}
        hint={income.value === null ? t('dashboard.noData') : t('dashboard.incomeHint')}
        note={baseNote(income, totalOperations)}
        accent="bg-chart-income"
      />
      <KpiCard
        label={t('dashboard.costs')}
        value={money(cost)}
        hint={cost.value === null ? t('dashboard.noData') : t('dashboard.costsHint')}
        note={baseNote(cost, totalOperations)}
        accent="bg-chart-cost"
      />
      <KpiCard
        label={t('dashboard.margin')}
        value={money(margin)}
        valueClassName={margin.value !== null && margin.value < 0 ? 'text-danger' : 'text-ink'}
        hint={marginHint}
        note={baseNote(margin, totalOperations, 'dashboard.marginBasePartial')}
        accent="bg-chart-margin"
      />
      <KpiCard
        label={t('dashboard.sla')}
        value={sla.pct === null ? NOT_AVAILABLE : formatPercent(sla.pct)}
        hint={
          sla.pct === null
            ? t('dashboard.slaUnavailable')
            : t('dashboard.slaHint', { met: formatInteger(sla.met), evaluated: formatInteger(sla.evaluated) })
        }
        accent="bg-brand-yellow"
      >
        {sla.pct !== null && (
          <div className="my-1 h-1.5 w-full overflow-hidden rounded-full bg-neutral-soft" aria-hidden="true">
            <div className="h-full rounded-full bg-brand" style={{ width: `${sla.pct}%` }} />
          </div>
        )}
      </KpiCard>
    </div>
  )
}
