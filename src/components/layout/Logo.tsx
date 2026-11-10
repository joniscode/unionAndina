import logoUrl from '../../assets/logo-union-andina.png'
import { t } from '../../lib/i18n'

interface LogoProps {
  className?: string
}

/** Logo corporativo original, sin modificaciones (solo se escala). */
export function Logo({ className = 'h-10 w-auto' }: LogoProps) {
  return <img src={logoUrl} alt={t('app.logoAlt')} width={300} height={110} className={className} />
}
