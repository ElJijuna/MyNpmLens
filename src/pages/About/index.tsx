import { useTranslation } from 'react-i18next'
import { StatusPage, Button, Link, Box } from '@gnome-ui/react'

const VERSION = '2.0.0'
const REPO_URL = 'https://github.com/ElJijuna/MyNpmLens'

export function AboutPage() {
  const { t } = useTranslation()

  return (
    <Box orientation="vertical" style={{ flex: 1 }}>
      <main className="page-content" style={{ justifyContent: 'center' }}>
        <StatusPage title={t('about.title')} description={t('about.description', { version: VERSION })}>
          <Box orientation="vertical" spacing={12} align="center">
            <Button variant="default" onClick={() => window.open(REPO_URL, '_blank')}>
              {t('about.githubRepo')}
            </Button>
            <Link href={`${REPO_URL}/issues/new`} target="_blank" rel="noopener noreferrer">
              {t('about.reportBug')}
            </Link>
            <Link href={`${REPO_URL}/releases`} target="_blank" rel="noopener noreferrer">
              {t('about.changelog')}
            </Link>
          </Box>
        </StatusPage>
      </main>
    </Box>
  )
}
