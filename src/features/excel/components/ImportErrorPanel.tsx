import { Alert } from '../../../components/ui/Alert'
import { Button } from '../../../components/ui/Button'
import { t } from '../../../lib/i18n'
import type { ImportError } from '../../../types/operation'

interface ImportErrorPanelProps {
  fileName: string
  error: ImportError
  hasActiveData: boolean
  onRetry: () => void
}

function describeError(error: ImportError): string {
  const missing = error.missingColumns?.length ?? 0
  switch (error.code) {
    case 'missingColumns':
      return error.sheetName
        ? t('errors.missingColumns', { sheetName: error.sheetName, count: missing })
        : t('errors.missingColumnsNoSheet', { count: missing })
    case 'emptyFile':
      return t('errors.emptyFile', { sheetName: error.sheetName ?? '' })
    default:
      return t(`errors.${error.code}`)
  }
}

export function ImportErrorPanel({ fileName, error, hasActiveData, onRetry }: ImportErrorPanelProps) {
  return (
    <div className="flex flex-col gap-4">
      <Alert tone="danger" title={t('errors.title')}>
        <p className="font-medium text-ink-muted">{t('stages.fileName', { fileName })}</p>
        <p className="mt-2">{describeError(error)}</p>
        {error.missingColumns && error.missingColumns.length > 0 && (
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {error.missingColumns.map((column) => (
              <li key={column}>
                <code className="rounded bg-surface px-1.5 py-0.5 text-xs text-danger">{column}</code>
              </li>
            ))}
          </ul>
        )}
        {hasActiveData && <p className="mt-3 font-medium">{t('errors.keepData')}</p>}
      </Alert>
      <div className="flex justify-end">
        <Button onClick={onRetry}>{t('errors.retry')}</Button>
      </div>
    </div>
  )
}
