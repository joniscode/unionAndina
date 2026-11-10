import { Alert } from '../../../components/ui/Alert'
import { Badge } from '../../../components/ui/Badge'
import { Button } from '../../../components/ui/Button'
import { APP_CONFIG } from '../../../config/app'
import { formatInteger } from '../../../lib/format'
import { t } from '../../../lib/i18n'
import type { DataIssue, DuplicateGroup, ImportPreview } from '../../../types/operation'

interface ImportReviewProps {
  preview: ImportPreview
  hasActiveData: boolean
  onConfirm: () => void
  onCancel: () => void
}

type StatTone = 'default' | 'brand' | 'warning' | 'danger'

const STAT_TONES: Record<StatTone, string> = {
  default: 'text-ink',
  brand: 'text-brand-dark',
  warning: 'text-warning',
  danger: 'text-danger',
}

function Stat({ label, value, tone = 'default' }: { label: string; value: number; tone?: StatTone }) {
  return (
    <div className="rounded-xl border border-line bg-canvas/60 p-3">
      <dt className="text-xs text-ink-muted">{label}</dt>
      <dd className={`mt-1 text-xl font-semibold tabular-nums ${STAT_TONES[tone]}`}>{formatInteger(value)}</dd>
    </div>
  )
}

function describeIssue(issue: DataIssue): string {
  return t(`issues.${issue.kind}`, { value: issue.value, expected: issue.expected ?? '' })
}

function DuplicatesTable({ duplicates }: { duplicates: DuplicateGroup[] }) {
  return (
    <div className="max-h-56 overflow-auto rounded-lg border border-line bg-surface">
      <table className="w-full text-left text-sm">
        <thead className="sticky top-0 bg-canvas text-xs text-ink-muted">
          <tr>
            <th className="px-3 py-2 font-medium">{t('review.duplicateId')}</th>
            <th className="px-3 py-2 font-medium">{t('review.keptRow')}</th>
            <th className="px-3 py-2 font-medium">{t('review.discardedRows')}</th>
            <th className="px-3 py-2 font-medium">{t('review.duplicateContent')}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {duplicates.map((group) => (
            <tr key={group.id}>
              <td className="px-3 py-2 font-medium">{group.id}</td>
              <td className="px-3 py-2 tabular-nums">{group.keptRow}</td>
              <td className="px-3 py-2 tabular-nums">{group.discardedRows.join(', ')}</td>
              <td className="px-3 py-2">
                {group.conflictingRows.length > 0 ? (
                  <Badge tone="warning">{t('review.duplicateConflict', { rows: group.conflictingRows.join(', ') })}</Badge>
                ) : (
                  <Badge tone="neutral">{t('review.duplicateIdentical')}</Badge>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function IssuesList({ issues }: { issues: DataIssue[] }) {
  // Errores primero: son los que excluyen registros.
  const sorted = [...issues].sort((a, b) => (a.severity === b.severity ? a.rowNumber - b.rowNumber : a.severity === 'error' ? -1 : 1))
  const visible = sorted.slice(0, APP_CONFIG.maxIssueDetails)
  const hidden = sorted.length - visible.length
  return (
    <ul className="mt-3 max-h-60 space-y-2 overflow-auto pr-1 text-sm">
      {visible.map((issue, index) => (
        <li key={`${issue.rowNumber}-${issue.column}-${index}`} className="flex flex-wrap items-start gap-x-2 gap-y-1">
          <Badge tone={issue.severity === 'error' ? 'danger' : 'warning'}>
            {t(issue.severity === 'error' ? 'review.severityError' : 'review.severityWarning')}
          </Badge>
          <span className="font-medium text-ink">
            {t('review.issueLocation', { sheet: issue.sheetName, row: issue.rowNumber, column: issue.column })}:
          </span>
          <span className="text-ink-muted">{describeIssue(issue)}</span>
        </li>
      ))}
      {hidden > 0 && <li className="text-ink-muted">{t('review.issuesMore', { count: formatInteger(hidden) })}</li>}
    </ul>
  )
}

/** Resumen previo: el usuario revisa antes de que los datos activos cambien. */
export function ImportReview({ preview, hasActiveData, onConfirm, onCancel }: ImportReviewProps) {
  const { summary, duplicates, issues } = preview
  const conflicts = duplicates.reduce((total, group) => total + group.conflictingRows.length, 0)
  const hasErrors = summary.errors > 0

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h3 className="text-lg font-semibold text-ink">{t('review.title')}</h3>
        <p className="mt-0.5 break-all text-sm text-ink-muted">
          {t('review.subtitle', { fileName: preview.fileName, sheetName: preview.sheetName })}
        </p>
      </div>

      <dl aria-label={t('review.statsLabel')} className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label={t('review.rowsRead')} value={summary.rowsRead} />
        <Stat label={t('review.duplicatesDiscarded')} value={summary.duplicatesDiscarded} tone={summary.duplicatesDiscarded > 0 ? 'warning' : 'default'} />
        <Stat label={t('review.uniqueRecords')} value={summary.uniqueRecords} />
        <Stat label={t('review.excludedRecords')} value={summary.excludedRecords} tone={summary.excludedRecords > 0 ? 'danger' : 'default'} />
        <Stat label={t('review.cleanRecords')} value={summary.cleanRecords} tone="brand" />
        <Stat label={t('review.recordsWithIssues')} value={summary.recordsWithIssues} tone={summary.recordsWithIssues > 0 ? 'warning' : 'default'} />
        <Stat label={t('review.warnings')} value={summary.warnings} tone={summary.warnings > 0 ? 'warning' : 'default'} />
        <Stat label={t('review.errors')} value={summary.errors} tone={hasErrors ? 'danger' : 'default'} />
      </dl>
      <p className="-mt-2 text-sm text-ink-muted">
        {t('review.usableNote', { usable: formatInteger(summary.usableRecords), unique: formatInteger(summary.uniqueRecords) })}
      </p>

      {duplicates.length > 0 ? (
        <Alert tone="warning" title={t('review.duplicatesTitle')}>
          <p>{t('review.duplicatesExplain')}</p>
          {conflicts > 0 && (
            <p className="mt-2 font-semibold text-warning">
              {t('review.conflictsTitle', { count: conflicts })}. {t('review.conflictsExplain')}
            </p>
          )}
          <div className="mt-3">
            <DuplicatesTable duplicates={duplicates} />
          </div>
        </Alert>
      ) : (
        <Alert tone="success" title={t('review.duplicatesNone')} />
      )}

      {issues.length > 0 ? (
        <Alert tone={hasErrors ? 'danger' : 'warning'} title={t('review.issuesTitle')}>
          <p>{t('review.issuesPolicy')}</p>
          <IssuesList issues={issues} />
        </Alert>
      ) : (
        <Alert tone="success" title={t('review.issuesNone')} />
      )}

      {hasActiveData && <Alert tone="info" title={t('review.replaceWarning')} />}

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={onCancel}>
          {t('review.cancel')}
        </Button>
        <Button onClick={onConfirm}>{t('review.confirm')}</Button>
      </div>
    </div>
  )
}
