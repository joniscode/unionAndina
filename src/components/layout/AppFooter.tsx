import { t } from '../../lib/i18n'

export function AppFooter() {
  return (
    <footer className="mx-auto max-w-7xl px-4 py-8 text-center text-xs text-ink-subtle sm:px-6">
      <p>
        {t('app.name')} · {t('app.footer')}
      </p>
    </footer>
  )
}
