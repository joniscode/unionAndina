import { Alert } from '../../../components/ui/Alert'
import { Button } from '../../../components/ui/Button'
import { EmptyState } from '../../../components/ui/EmptyState'
import { Panel } from '../../../components/ui/Panel'
import { SECTION_IDS } from '../../../config/sections'
import { formatInteger } from '../../../lib/format'
import { t } from '../../../lib/i18n'
import type { Dataset } from '../../../types/operation'
import { FiltersBar } from '../../filters/components/FiltersBar'
import { RecordsTable } from '../../records/components/RecordsTable'
import { useDashboardData } from '../hooks/useDashboardData'
import { FinancialChart } from './FinancialChart'
import { KpiGrid } from './KpiGrid'
import { StatusChart } from './StatusChart'

interface DashboardProps {
  dataset: Dataset
}

export function Dashboard({ dataset }: DashboardProps) {
  const data = useDashboardData(dataset.records)
  const { kpis, filters } = data
  const hasResults = data.filtered.length > 0

  return (
    <div className="flex flex-col gap-6">
      <FiltersBar
        filters={filters}
        options={data.options}
        activeCount={data.activeFilters}
        shown={data.filtered.length}
        total={dataset.records.length}
        onChange={data.setFilter}
        onClear={data.clearFilters}
      />

      <section id={SECTION_IDS.summary} aria-labelledby="summary-title" className="flex flex-col gap-3">
        <div>
          <h2 id="summary-title" className="text-xl font-bold text-ink">
            {t('dashboard.title')}
          </h2>
          <p className="text-sm text-ink-muted">{t('dashboard.subtitle')}</p>
        </div>
        <KpiGrid kpis={kpis} totalRecords={dataset.records.length} />
        {kpis.excludedFromFinancials > 0 && (
          <Alert tone="warning" title={t('dashboard.financialExcluded', { count: formatInteger(kpis.excludedFromFinancials) })} />
        )}
      </section>

      {hasResults ? (
        <>
          <section id={SECTION_IDS.charts} aria-label={t('charts.title')} className="grid grid-cols-1 gap-6 xl:grid-cols-5">
            <Panel title={t('charts.financialTitle')} subtitle={t('charts.financialSubtitle')} className="xl:col-span-3">
              <FinancialChart data={data.financialByZone} />
            </Panel>
            <Panel title={t('charts.operationalTitle')} subtitle={t('charts.operationalSubtitle')} className="xl:col-span-2">
              <StatusChart data={data.operationsByStatus} />
            </Panel>
          </section>
          <section id={SECTION_IDS.records}>
            {/* La key reinicia búsqueda y paginación cuando cambian los filtros. */}
            <RecordsTable key={JSON.stringify(filters)} records={data.filtered} />
          </section>
        </>
      ) : (
        <Panel>
          <EmptyState
            title={t('dashboard.noResultsTitle')}
            description={t('dashboard.noResultsBody')}
            action={<Button onClick={data.clearFilters}>{t('filters.clear')}</Button>}
          />
        </Panel>
      )}
    </div>
  )
}
