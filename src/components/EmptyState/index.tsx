import { Add, StarOutline } from '@gnome-ui/icons';
import { Button, Icon, StatusPage } from '@gnome-ui/react';
import { useTranslation } from 'react-i18next';

interface EmptyStateProps {
  onAddClick: () => void;
}

export const EmptyState = ({ onAddClick }: EmptyStateProps) => {
  const { t } = useTranslation();

  return (
    <StatusPage
      icon={StarOutline}
      title={t('emptyState.title')}
      description={t('emptyState.description')}
    >
      <Button variant="suggested" onClick={onAddClick} leadingIcon={<Icon icon={Add} />}>
        {t('emptyState.addPackage')}
      </Button>
    </StatusPage>
  );
};
