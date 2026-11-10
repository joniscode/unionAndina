import { formatCurrency, formatInteger, formatPercent } from '../../../lib/format'
import { t } from '../../../lib/i18n'
import type { Kpis } from '../../../lib/metrics'
import { KpiCard } from './KpiCard'

interface KpiGridProps {
  kpis: Kpis
  totalRecords: number
}

export function KpiGrid({ kpis, totalRecords }: KpiGridProps) {
  const { financial, sla } = kpis
  const notAvailable = t('dashboard.notAvailable')
  const negativeMargin = financial.margin < 0

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      <KpiCard
        label={t('dashboard.totalOperations')}
        value={formatInteger(kpis.totalOperations)}
        hint={t('dashboard.totalOperationsHint', { total: formatInteger(totalRecords) })}
        accent="bg-brand-dark"
      />
      <KpiCard
        label={t('dashboard.income')}
        value={formatCurrency(financial.income)}
        hint={t('dashboard.incomeHint')}
        accent="bg-chart-income"
      />
      <KpiCard
        label={t('dashboard.costs')}
        value={formatCurrency(financial.cost)}
        hint={t('dashboard.costsHint')}
        accent="bg-chart-cost"
      />
      <KpiCard
        label={t('dashboard.margin')}
        value={formatCurrency(financial.margin)}
        valueClassName={negativeMargin ? 'text-danger' : 'text-ink'}
        hint={
          financial.marginPct === null
            ? t('dashboard.marginHintUnavailable')
            : t('dashboard.marginHint', { pct: formatPercent(financial.marginPct) })
        }
        accent="bg-chart-margin"
      />
      <KpiCard
        label={t('dashboard.sla')}
        value={sla.pct === null ? notAvailable : formatPercent(sla.pct)}
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
