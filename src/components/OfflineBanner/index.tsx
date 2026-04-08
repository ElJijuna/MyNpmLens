import { useState } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { Banner } from '@gnome-ui/react'

export function OfflineBanner() {
  const [dismissed, setDismissed] = useState(false)
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW()

  if (dismissed) return null

  if (needRefresh) {
    return (
      <Banner
        variant="info"
        actionLabel="Update"
        onAction={() => updateServiceWorker(true)}
        dismissible
        onDismiss={() => setDismissed(true)}
      >
        A new version of My Npm Lens is available.
      </Banner>
    )
  }

  return null
}
