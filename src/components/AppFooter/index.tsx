import { useState } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { Footer, Button, Spinner } from '@gnome-ui/react'
import { version } from '../../../package.json'

export function AppFooter() {
  const [checking, setChecking] = useState(false)
  const [upToDate, setUpToDate] = useState(false)

  const { needRefresh: [needRefresh] } = useRegisterSW()

  async function handleCheckUpdate() {
    setChecking(true)
    setUpToDate(false)
    try {
      const reg = await navigator.serviceWorker.getRegistration()
      await reg?.update()
      if (!needRefresh) {
        setUpToDate(true)
        setTimeout(() => setUpToDate(false), 3000)
      }
    } finally {
      setChecking(false)
    }
  }

  const label = checking ? 'Checking…' : upToDate ? 'Up to date!' : 'Check for updates'

  return (
    <Footer
      start={<span style={{ opacity: 0.6, fontSize: '0.8rem' }}>v{version}</span>}
      end={
        <>
          <Button variant="flat" size="sm" disabled={checking} onClick={handleCheckUpdate}>
            {label}
          </Button>
          {checking && <Spinner size="sm" />}
        </>
      }
    >
      <span style={{ opacity: 0.6, fontSize: '0.8rem' }}>© {new Date().getFullYear()}</span>
    </Footer>
  )
}
