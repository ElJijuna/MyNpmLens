import { useRegisterSW } from 'virtual:pwa-register/react'
import { Dialog } from '@gnome-ui/react'
import { Analytics } from '@/lib/analytics'

export function OfflineBanner() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW()

  return (
    <Dialog
      open={needRefresh}
      title="New version available"
      closeOnBackdrop={false}
      buttons={[
        { label: 'Cancel', variant: 'default', onClick: () => setNeedRefresh(false) },
        {
          label: 'Update',
          variant: 'suggested',
          onClick: () => {
            Analytics.appUpdate()
            setNeedRefresh(false)
            updateServiceWorker(true)
          },
        },
      ]}
    >
      A new version of Npm Lens is available. Update now to get the latest features and fixes.
    </Dialog>
  )
}
