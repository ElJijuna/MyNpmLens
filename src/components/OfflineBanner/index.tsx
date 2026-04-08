import { useRegisterSW } from 'virtual:pwa-register/react'
import { Dialog } from '@gnome-ui/react'

export function OfflineBanner() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW()

  function handleResponse(id: string) {
    if (id === 'update') {
      updateServiceWorker(true)
    } else {
      setNeedRefresh(false)
    }
  }

  return (
    <Dialog
      open={needRefresh}
      role="alertdialog"
      title="New version available"
      responses={[
        { id: 'update', label: 'Update', variant: 'suggested' },
        { id: 'cancel', label: 'Cancel' },
      ]}
      onResponse={handleResponse}
      closeOnBackdrop={false}
    >
      A new version of My Npm Lens is available. Update now to get the latest features and fixes.
    </Dialog>
  )
}
