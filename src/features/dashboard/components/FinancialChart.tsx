import { Bar, BarChart, CartesianGrid, Legend, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { EmptyState } from '../../../components/ui/EmptyState'
import { CHART_COLORS, CHART_LAYOUT } from '../../../config/chartTheme'
import { formatCompactCurrency, formatCurrency } from '../../../lib/format'
import { t } from '../../../lib/i18n'
import type { FinancialGroup } from '../../../lib/metrics'

interface FinancialChartProps {
  data: FinancialGroup[]
}

const SERIES = [
  { key: 'income', label: 'charts.income', color: CHART_COLORS.income },
  { key: 'cost', label: 'charts.costs', color: CHART_COLORS.cost },
  { key: 'margin', label: 'charts.margin', color: CHART_COLORS.margin },
] as const

/** El texto de la leyenda usa el color de tinta; el color de la serie va en el icono. */
const legendLabel = (value: string) => <span style={{ color: 'var(--color-ink)' }}>{value}</span>

const tooltipValue = (value: unknown): string => (typeof value === 'number' ? formatCurrency(value) : String(value))

/** Barras horizontales agrupadas: legibles en móvil y con zonas de nombre largo. */
export function FinancialChart({ data }: FinancialChartProps) {
  if (data.length === 0) return <EmptyState title={t('charts.empty')} />

  const rows = data.map((group) => ({ ...group, name: group.key ?? t('charts.noValue') }))
  const height = Math.max(CHART_LAYOUT.minHeight, rows.length * CHART_LAYOUT.rowHeight + 60)

  return (
    <figure role="img" aria-label={t('charts.financialAria')} className="m-0">
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={rows} layout="vertical" margin={{ top: 4, right: 16, bottom: 4, left: 4 }} barGap={2} barCategoryGap="22%">
          <CartesianGrid horizontal={false} stroke={CHART_COLORS.grid} />
          <XAxis
            type="number"
            tickFormatter={formatCompactCurrency}
            tick={{ fontSize: 12, fill: CHART_COLORS.axis }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={CHART_LAYOUT.categoryWidth}
            tick={{ fontSize: 12, fill: CHART_COLORS.axis }}
            axisLine={false}
            tickLine={false}
          />
          <ReferenceLine x={0} stroke={CHART_COLORS.zeroLine} />
          <Tooltip formatter={tooltipValue} cursor={{ fill: 'var(--color-neutral-soft)' }} />
          <Legend
            verticalAlign="top"
            align="left"
            iconType="circle"
            itemSorter={null}
            formatter={legendLabel}
            wrapperStyle={{ fontSize: 13, paddingBottom: 8 }}
          />
          {SERIES.map((series) => (
            <Bar
              key={series.key}
              dataKey={series.key}
              name={t(series.label)}
              fill={series.color}
              barSize={CHART_LAYOUT.barSize}
              radius={[0, 4, 4, 0]}
              isAnimationActive={false}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </figure>
  )
}
