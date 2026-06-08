import { useTranslation } from 'react-i18next'
import { StatusPage, Button, Icon } from '@gnome-ui/react'
import { Add, StarOutline } from '@gnome-ui/icons'

interface EmptyStateProps {
  onAddClick: () => void
}

export function EmptyState({ onAddClick }: EmptyStateProps) {
  const { t } = useTranslation()

  return (
    <StatusPage icon={StarOutline} title={t('emptyState.title')} description={t('emptyState.description')}>
      <Button variant="suggested" onClick={onAddClick} leadingIcon={<Icon icon={Add} />}>
        {t('emptyState.addPackage')}
      </Button>
    </StatusPage>
  )
}
