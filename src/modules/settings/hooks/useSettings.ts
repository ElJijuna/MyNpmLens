import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { usePushToGist } from '@/modules/gist/hooks';
import type { AppSettings } from '@/modules/settings/domain';
import { settingsStorage } from '@/store/settings';

export const SETTINGS_QUERY_KEY = ['settings'] as const;

export function useSettings() {
  return useQuery<AppSettings>({
    queryKey: SETTINGS_QUERY_KEY,
    queryFn: () => settingsStorage.get(),
    staleTime: Infinity,
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();
  const pushToGist = usePushToGist();

  return useMutation({
    mutationFn: async (partial: Partial<AppSettings>) => {
      const current = await settingsStorage.get();
      await settingsStorage.set({ ...current, ...partial });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SETTINGS_QUERY_KEY });
      pushToGist.mutate();
    },
  });
}
