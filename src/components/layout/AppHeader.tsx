import type { ReactNode } from 'react'
import { t } from '../../lib/i18n'
import { Logo } from './Logo'

interface NavItem {
  href: string
  label: string
}

interface AppHeaderProps {
  nav?: NavItem[]
  actions?: ReactNode
  onHome?: () => void
}

export function AppHeader({ nav = [], actions, onHome }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-surface/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3 sm:px-6">
        <button
          type="button"
          onClick={onHome}
          disabled={!onHome}
          title={t('nav.home')}
          aria-label={`${t('nav.home')} · ${t('app.name')}`}
          className="flex items-center gap-3 rounded-lg text-left enabled:cursor-pointer enabled:hover:opacity-85"
        >
          <Logo className="h-9 w-auto sm:h-10" />
          <span className="hidden border-l border-line pl-3 sm:block">
            <span className="block text-sm font-bold leading-tight text-brand-dark">{t('app.name')}</span>
            <span className="block text-xs text-ink-muted">{t('app.description')}</span>
          </span>
        </button>
        {nav.length > 0 && (
          <nav aria-label={t('nav.ariaLabel')} className="order-3 w-full md:order-none md:w-auto">
            <ul className="flex gap-1 overflow-x-auto">
              {nav.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className="block rounded-lg px-3 py-1.5 text-sm font-medium text-ink-muted hover:bg-brand-soft hover:text-brand-dark"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        )}
        {actions && <div className="ml-auto flex items-center gap-2">{actions}</div>}
      </div>
      <div aria-hidden="true" className="flex h-1">
        <span className="flex-[6] bg-brand" />
        <span className="flex-[2] bg-brand-yellow" />
        <span className="flex-1 bg-brand-orange" />
      </div>
    </header>
  )
}
