import { Alert } from '../../../components/ui/Alert'
import { Button } from '../../../components/ui/Button'
import { APP_CONFIG } from '../../../config/app'
import { formatInteger } from '../../../lib/format'
import { t } from '../../../lib/i18n'
import type { DataIssue, ImportPreview } from '../../../types/operation'

interface ImportReviewProps {
  preview: ImportPreview
  hasActiveData: boolean
  onConfirm: () => void
  onCancel: () => void
}

function Stat({ label, value, tone = 'text-ink' }: { label: string; value: number; tone?: string }) {
  return (
    <div className="rounded-xl border border-line bg-canvas/60 p-3">
      <dt className="text-xs text-ink-muted">{label}</dt>
      <dd className={`mt-1 text-xl font-semibold tabular-nums ${tone}`}>{formatInteger(value)}</dd>
    </div>
  )
}

function describeIssue(issue: DataIssue): string {
  return t(`issues.${issue.kind}`, { column: issue.column, value: issue.value })
}

function DuplicatesTable({ preview }: { preview: ImportPreview }) {
  return (
    <div className="max-h-56 overflow-auto rounded-lg border border-line">
      <table className="w-full text-left text-sm">
        <thead className="sticky top-0 bg-canvas text-xs text-ink-muted">
          <tr>
            <th className="px-3 py-2 font-medium">{t('review.duplicateId')}</th>
            <th className="px-3 py-2 font-medium">{t('review.keptRow')}</th>
            <th className="px-3 py-2 font-medium">{t('review.discardedRows')}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {preview.duplicates.map((group) => (
            <tr key={group.id}>
              <td className="px-3 py-2 font-medium">{group.id}</td>
              <td className="px-3 py-2 tabular-nums">{group.keptRow}</td>
              <td className="px-3 py-2 tabular-nums">{group.discardedRows.join(', ')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function IssuesList({ issues }: { issues: DataIssue[] }) {
  const visible = issues.slice(0, APP_CONFIG.maxIssueDetails)
  const hidden = issues.length - visible.length
  return (
    <ul className="mt-2 max-h-44 space-y-1 overflow-auto pr-1 text-sm">
      {visible.map((issue, index) => (
        <li key={`${issue.rowNumber}-${issue.column}-${index}`}>
          <span className="font-medium">{t('review.issueRow', { row: issue.rowNumber })}: </span>
          {describeIssue(issue)}
        </li>
      ))}
      {hidden > 0 && <li className="text-ink-muted">{t('review.issuesMore', { count: hidden })}</li>}
    </ul>
  )
}

/** Resumen previo: el usuario revisa antes de que los datos activos cambien. */
export function ImportReview({ preview, hasActiveData, onConfirm, onCancel }: ImportReviewProps) {
  const hasDuplicates = preview.duplicates.length > 0
  const hasIssues = preview.issues.length > 0
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h3 className="text-lg font-semibold text-ink">{t('review.title')}</h3>
        <p className="mt-0.5 break-all text-sm text-ink-muted">
          {t('review.subtitle', { fileName: preview.fileName, sheetName: preview.sheetName })}
        </p>
      </div>

      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label={t('review.rowsRead')} value={preview.rowsRead} />
        <Stat label={t('review.uniqueOperations')} value={preview.records.length} tone="text-brand-dark" />
        <Stat label={t('review.duplicatesDiscarded')} value={preview.duplicatesDiscarded} tone={hasDuplicates ? 'text-warning' : 'text-ink'} />
        <Stat label={t('review.issuesFound')} value={preview.issues.length} tone={hasIssues ? 'text-warning' : 'text-ink'} />
      </dl>

      {hasDuplicates ? (
        <Alert tone="warning" title={t('review.duplicatesTitle')}>
          <p>{t('review.duplicatesExplain')}</p>
          <div className="mt-3">
            <DuplicatesTable preview={preview} />
          </div>
        </Alert>
      ) : (
        <Alert tone="success" title={t('review.duplicatesNone')} />
      )}

      {hasIssues ? (
        <Alert tone="warning" title={t('review.issuesTitle')}>
          <p>{t('review.issuesExplain')}</p>
          <IssuesList issues={preview.issues} />
        </Alert>
      ) : (
        <Alert tone="success" title={t('review.issuesNone')} />
      )}

      {hasActiveData && <Alert tone="info" title={t('review.replaceWarning')} />}

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={onCancel}>
          {t('review.cancel')}
        </Button>
        <Button onClick={onConfirm}>
          {t('review.confirm')}
        </Button>
      </div>
    </div>
  )
}
