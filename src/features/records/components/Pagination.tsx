import { Button } from '../../../components/ui/Button'
import { t } from '../../../lib/i18n'

interface PaginationProps {
  page: number
  pages: number
  onChange: (page: number) => void
}

export function Pagination({ page, pages, onChange }: PaginationProps) {
  return (
    <nav aria-label={t('table.paginationLabel')} className="flex items-center gap-2">
      <Button variant="secondary" onClick={() => onChange(page - 1)} disabled={page <= 1}>
        {t('table.previous')}
      </Button>
      <span className="min-w-28 text-center text-sm text-ink-muted tabular-nums" aria-live="polite">
        {t('table.pageInfo', { page, pages })}
      </span>
      <Button variant="secondary" onClick={() => onChange(page + 1)} disabled={page >= pages}>
        {t('table.next')}
      </Button>
    </nav>
  )
}
