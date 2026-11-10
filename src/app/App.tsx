import { lazy, Suspense, useEffect, useState } from 'react'
import { AppFooter } from '../components/layout/AppFooter'
import { AppHeader } from '../components/layout/AppHeader'
import { Alert } from '../components/ui/Alert'
import { Button } from '../components/ui/Button'
import { IconUpload } from '../components/ui/icons'
import { Spinner } from '../components/ui/Spinner'
import { APP_CONFIG } from '../config/app'
import { SECTION_IDS } from '../config/sections'
import { UploadDialog } from '../features/excel/components/UploadDialog'
import { isProcessing } from '../features/excel/hooks/importReducer'
import { useExcelImport } from '../features/excel/hooks/useExcelImport'
import { formatInteger } from '../lib/format'
import { t } from '../lib/i18n'
import { WelcomeScreen } from './WelcomeScreen'

// Recharts solo se descarga cuando existen datos confirmados.
const Dashboard = lazy(() =>
  import('../features/dashboard/components/Dashboard').then((module) => ({ default: module.Dashboard })),
)

const NAV = [
  { href: `#${SECTION_IDS.summary}`, label: t('nav.summary') },
  { href: `#${SECTION_IDS.charts}`, label: t('nav.charts') },
  { href: `#${SECTION_IDS.records}`, label: t('nav.records') },
]

export function App() {
  const importer = useExcelImport()
  const { active, flow, dismiss, cancel, reset } = importer
  const [dialogOpen, setDialogOpen] = useState(false)

  const flowProps = {
    flow,
    hasActiveData: active !== null,
    onFile: importer.importFile,
    onDemo: importer.importDemo,
    onConfirm: importer.confirm,
    onCancel: cancel,
  }

  // La notificación de éxito se oculta sola tras unos segundos.
  useEffect(() => {
    if (flow.stage !== 'success') return
    const timer = setTimeout(dismiss, APP_CONFIG.successNoticeMs)
    return () => clearTimeout(timer)
  }, [flow.stage, dismiss])

  if (!active) {
    return (
      <div className="flex min-h-screen flex-col">
        <WelcomeScreen {...flowProps} />
        <AppFooter />
      </div>
    )
  }

  const openDialog = () => {
    if (flow.stage === 'success') dismiss()
    setDialogOpen(true)
  }
  const goHome = () => {
    if (isProcessing(flow) || !window.confirm(t('nav.homeConfirm'))) return
    setDialogOpen(false)
    reset()
    window.scrollTo({ top: 0 })
  }
  const closeDialog = () => {
    cancel()
    setDialogOpen(false)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader
        nav={NAV}
        onHome={goHome}
        actions={
          <Button onClick={openDialog}>
            <IconUpload width={18} height={18} />
            {t('header.loadAnother')}
          </Button>
        }
      />
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-4 px-4 py-6 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-ink">{t('header.sourceFile', { fileName: active.fileName })}</p>
            <p className="text-xs text-ink-muted">
              {t('header.sourceDetail', { sheetName: active.sheetName, count: formatInteger(active.records.length) })}
            </p>
          </div>
        </div>

        {active.source === 'demo' && (
          <Alert tone="info" title={t('header.demoBadge')}>
            {t('header.demoNotice')}
          </Alert>
        )}

        {flow.stage === 'success' && (
          <Alert tone="success" title={t('success.message', { count: formatInteger(flow.operations), fileName: flow.fileName })} onDismiss={dismiss} dismissLabel={t('success.dismiss')} />
        )}

        <Suspense
          fallback={
            <div className="flex justify-center py-16">
              <Spinner label={t('stages.applying')} />
            </div>
          }
        >
          <Dashboard key={active.loadedAt} dataset={active} />
        </Suspense>
      </main>
      <AppFooter />

      {dialogOpen && flow.stage !== 'success' && (
        <UploadDialog {...flowProps} onClose={closeDialog} canClose={!isProcessing(flow)} />
      )}
    </div>
  )
}
