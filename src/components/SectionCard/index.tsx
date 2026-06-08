import { Banner, Card, Spinner, Text } from '@gnome-ui/react';
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
    <Card padding="lg">
      <Text variant="title-4" as="h2" style={{ marginBottom: '1rem' }}>
        {title}
      </Text>

      {isLoading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '1.5rem' }}>
          <Spinner size="md" />
        </div>
      )}

      {!isLoading && error && (
        <Banner variant="error">{error.message ?? t('sectionCard.error')}</Banner>
      )}

      {!isLoading && !error && children}
    </Card>
  );
};
