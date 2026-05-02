import { useTranslation } from 'react-i18next'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { Dialog } from '@gnome-ui/react'
import { Analytics } from '@/lib/analytics'

export function OfflineBanner() {
  const { t } = useTranslation()
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW()

  return (
    <Dialog
      open={needRefresh}
      title={t('offline.title')}
      closeOnBackdrop={false}
      buttons={[
        { label: t('offline.cancel'), variant: 'default', onClick: () => setNeedRefresh(false) },
        {
          label: t('offline.update'),
          variant: 'suggested',
          onClick: () => {
            Analytics.appUpdate()
            setNeedRefresh(false)
            updateServiceWorker(true)
          },
        },
      ]}
    >
      {t('offline.description')}
    </Dialog>
  )
}
