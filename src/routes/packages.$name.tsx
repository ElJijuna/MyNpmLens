import { createFileRoute } from '@tanstack/react-router';
import { PackageDetailPage } from '@/pages/PackageDetail';

export const Route = createFileRoute('/packages/$name')({
  validateSearch: (search: Record<string, unknown>) => ({
    version: typeof search.version === 'string' ? search.version : undefined,
    fromMaintainer: typeof search.fromMaintainer === 'string' ? search.fromMaintainer : undefined,
  }),
  component: PackageDetailPage,
});
