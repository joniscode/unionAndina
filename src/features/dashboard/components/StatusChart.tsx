import { Bar, BarChart, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { EmptyState } from '../../../components/ui/EmptyState'
import { CHART_COLORS, CHART_LAYOUT, TONE_COLORS } from '../../../config/chartTheme'
import { toneForStatus } from '../../../config/statusTones'
import { formatInteger, formatPercent } from '../../../lib/format'
import { t } from '../../../lib/i18n'
import { ratioPercent, type CountGroup } from '../../../lib/metrics'

interface StatusChartProps {
  data: CountGroup[]
}

/** Distribución por estado: color de estado + etiqueta directa con el conteo. */
export function StatusChart({ data }: StatusChartProps) {
  if (data.length === 0) return <EmptyState title={t('charts.empty')} />

  const total = data.reduce((sum, group) => sum + group.count, 0)
  const rows = data.map((group) => ({
    name: group.key ?? t('charts.noValue'),
    count: group.count,
    color: TONE_COLORS[toneForStatus(group.key)],
  }))
  const height = Math.max(CHART_LAYOUT.minHeight, rows.length * CHART_LAYOUT.statusRowHeight + 40)

  const tooltipValue = (value: unknown): [string, string] => {
    const count = typeof value === 'number' ? value : 0
    const pct = ratioPercent(count, total) ?? 0
    return [t('charts.operationsShare', { count: formatInteger(count), pct: formatPercent(pct) }), t('charts.operations')]
  }

  return (
    <figure role="img" aria-label={t('charts.operationalAria')} className="m-0">
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={rows} layout="vertical" margin={{ top: 4, right: 40, bottom: 4, left: 4 }} barCategoryGap="28%">
          <XAxis type="number" allowDecimals={false} hide />
          <YAxis
            type="category"
            dataKey="name"
            width={CHART_LAYOUT.categoryWidth}
            tick={{ fontSize: 12, fill: CHART_COLORS.axis }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip formatter={tooltipValue} cursor={{ fill: 'var(--color-neutral-soft)' }} />
          <Bar dataKey="count" name={t('charts.operations')} radius={[0, 4, 4, 0]} maxBarSize={28} isAnimationActive={false}>
            {rows.map((row) => (
              <Cell key={row.name} fill={row.color} />
            ))}
            <LabelList dataKey="count" position="right" style={{ fontSize: 12, fill: 'var(--color-ink)', fontWeight: 600 }} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </figure>
  )
}
