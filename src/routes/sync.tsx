import { createFileRoute } from '@tanstack/react-router';
import { DataSyncPage } from '@/pages/DataSync';

export const Route = createFileRoute('/sync')({
  component: DataSyncPage,
});
