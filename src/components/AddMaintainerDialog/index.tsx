import { useToast } from '@gnome-ui/layout/components/Toast';
import { Dialog, TextField } from '@gnome-ui/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Analytics } from '@/lib/analytics';
import { useAddMaintainer, useMaintainers } from '@/modules/npm/hooks';
import { ProxyError } from '@/modules/npm/proxy';

interface AddMaintainerDialogProps {
  open: boolean;
  onClose: () => void;
}

export const AddMaintainerDialog = ({ open, onClose }: AddMaintainerDialogProps) => {
  const { t } = useTranslation();
  const toast = useToast();
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | undefined>();
  const { data: maintainers = [] } = useMaintainers();
  const addMaintainer = useAddMaintainer();

  async function handleConfirm() {
    const username = input.trim().toLowerCase();
    if (!username) {
      return;
    }

    if (maintainers.some((m) => m.username === username)) {
      setError(t('addMaintainer.errorAlreadyAdded', { username }));
      return;
    }

    Analytics.addMaintainer(username);
    addMaintainer.mutate(username, {
      onSuccess: () => {
        toast.show({ title: t('addMaintainer.toastSuccess', { username }), type: 'success' });
        setInput('');
        setError(undefined);
        onClose();
      },
      onError: (err) => {
        if (err instanceof ProxyError && err.status === 404) {
          setError(t('addMaintainer.errorNotFound', { username }));
        } else {
          setError(t('addMaintainer.errorNetwork'));
        }
      },
    });
  }

  function handleClose() {
    setInput('');
    setError(undefined);
    onClose();
  }

  const isBusy = addMaintainer.isPending;

  return (
    <Dialog
      open={open}
      title={t('addMaintainer.title')}
      onClose={handleClose}
      buttons={[
        {
          label: t('addMaintainer.cancel'),
          variant: 'default',
          onClick: handleClose,
          disabled: isBusy,
        },
        {
          label: isBusy ? t('addMaintainer.searching') : t('addMaintainer.add'),
          variant: 'suggested',
          onClick: handleConfirm,
          disabled: input.trim().length === 0 || isBusy,
        },
      ]}
    >
      <TextField
        label={t('addMaintainer.usernameLabel')}
        placeholder={t('addMaintainer.usernamePlaceholder')}
        value={input}
        onChange={(e) => {
          setInput(e.target.value);
          if (error) {
            setError(undefined);
          }
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && input.trim().length > 0 && !isBusy) {
            void handleConfirm();
          }
        }}
        error={error}
        autoFocus
        autoCapitalize="none"
      />
    </Dialog>
  );
};
