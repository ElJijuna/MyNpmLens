import { LoadingStatus } from '@gnome-ui/layout';
import { PanelCard } from '@gnome-ui/layout/components/PanelCard';
import { Banner, Spinner, Text } from '@gnome-ui/react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

interface SectionCardProps {
  title: string;
  isLoading: boolean;
  error?: Error | null;
  children: ReactNode;
}

export const SectionCard = ({ title, isLoading, error, children }: SectionCardProps) => {
  const { t } = useTranslation();

  return (
    <PanelCard
      title={
        <Text variant="caption-heading" as="h2">
          {title}
        </Text>
      }
      collapsible={false}
    >
      {isLoading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '1.5rem' }}>
          <LoadingStatus />
          <Spinner size="md" label="" />
        </div>
      )}

      {!isLoading && error && (
        <Banner variant="error">{error.message ?? t('sectionCard.error')}</Banner>
      )}

      {!isLoading && !error && children}
    </PanelCard>
  );
};
