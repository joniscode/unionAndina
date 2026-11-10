import { Logo } from '../components/layout/Logo'
import { IconInfo } from '../components/ui/icons'
import { ImportFlow, type ImportFlowProps } from '../features/excel/components/ImportFlow'
import { t } from '../lib/i18n'

const STEPS = ['welcome.step1', 'welcome.step2', 'welcome.step3'] as const

/** Pantalla inicial: no se muestra un dashboard vacío ni se cargan datos automáticamente. */
export function WelcomeScreen(flowProps: ImportFlowProps) {
  return (
    <main className="mx-auto grid w-full max-w-6xl flex-1 items-center gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_1.1fr] lg:gap-12 lg:py-16">
      <section className="flex flex-col gap-6">
        <Logo className="h-16 w-auto self-start sm:h-20" />
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-brand">{t('welcome.eyebrow')}</p>
          <h1 className="mt-2 text-3xl font-bold leading-tight text-ink sm:text-4xl">{t('welcome.title')}</h1>
          <p className="mt-4 text-base text-ink-muted">{t('welcome.subtitle')}</p>
        </div>
        <div>
          <h2 className="text-sm font-semibold text-ink">{t('welcome.stepsTitle')}</h2>
          <ol className="mt-3 flex flex-col gap-3">
            {STEPS.map((step, index) => (
              <li key={step} className="flex items-start gap-3 text-sm text-ink-muted">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-brand text-xs font-bold text-white">
                  {index + 1}
                </span>
                {t(step)}
              </li>
            ))}
          </ol>
        </div>
        <p className="flex items-start gap-2 text-xs text-ink-subtle">
          <IconInfo width={16} height={16} className="shrink-0 text-info" />
          {t('welcome.privacy')}
        </p>
      </section>

      <section aria-labelledby="upload-title" className="rounded-2xl border border-line bg-surface p-5 sm:p-8">
        <h2 id="upload-title" className="mb-5 text-lg font-semibold text-ink">
          {t('upload.title')}
        </h2>
        <ImportFlow {...flowProps} />
      </section>
    </main>
  )
}
