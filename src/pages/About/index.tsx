import { StatusPage, Button, Link, Box } from '@gnome-ui/react'
import { Toolbar } from '@/components/Toolbar'

const VERSION = '2.0.0'
const REPO_URL = 'https://github.com/ElJijuna/MyNpmLens'

export function AboutPage() {
  return (
    <Box orientation="vertical" style={{ flex: 1 }}>
      <Toolbar />

      <main className="page-content" style={{ justifyContent: 'center' }}>
        <StatusPage
          title="MyNpmLens"
          description={`Version ${VERSION} — Track npm packages, follow maintainers, and stay up to date with the ecosystem.`}
        >
          <Box orientation="vertical" spacing={6} align="center">
            <Button variant="default" onClick={() => window.open(REPO_URL, '_blank')}>
              GitHub Repository
            </Button>
            <Link href={`${REPO_URL}/issues/new`} target="_blank" rel="noopener noreferrer">
              Report a bug
            </Link>
            <Link href={`${REPO_URL}/releases`} target="_blank" rel="noopener noreferrer">
              Changelog
            </Link>
          </Box>
        </StatusPage>
      </main>
    </Box>
  )
}
