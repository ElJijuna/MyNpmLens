import { useState } from 'react'
import { Dialog, TextField } from '@gnome-ui/react'
import { useAddMaintainer, useMaintainers } from '@/modules/npm/hooks'
import { ProxyError } from '@/modules/npm/proxy'

interface AddMaintainerDialogProps {
  open: boolean
  onClose: () => void
}

export function AddMaintainerDialog({ open, onClose }: AddMaintainerDialogProps) {
  const [input, setInput] = useState('')
  const [error, setError] = useState<string | undefined>()
  const { data: maintainers = [] } = useMaintainers()
  const addMaintainer = useAddMaintainer()

  async function handleConfirm() {
    const username = input.trim().toLowerCase()
    if (!username) return

    if (maintainers.some((m) => m.username === username)) {
      setError(`"${username}" is already in your list.`)
      return
    }

    addMaintainer.mutate(username, {
      onSuccess: () => {
        setInput('')
        setError(undefined)
        onClose()
      },
      onError: (err) => {
        if (err instanceof ProxyError && err.status === 404) {
          setError(`Maintainer "${username}" was not found on npm.`)
        } else {
          setError('Could not reach the npm registry. Check your connection.')
        }
      },
    })
  }

  function handleClose() {
    setInput('')
    setError(undefined)
    onClose()
  }

  const isBusy = addMaintainer.isPending

  return (
    <Dialog
      open={open}
      title="Add maintainer"
      onClose={handleClose}
      buttons={[
        { label: 'Cancel', variant: 'default', onClick: handleClose, disabled: isBusy },
        {
          label: isBusy ? 'Searching…' : 'Add',
          variant: 'suggested',
          onClick: handleConfirm,
          disabled: input.trim().length === 0 || isBusy,
        },
      ]}
    >
      <TextField
        label="npm username"
        placeholder="e.g. sindresorhus"
        value={input}
        onChange={(e) => {
          setInput(e.target.value)
          if (error) setError(undefined)
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && input.trim().length > 0 && !isBusy) handleConfirm()
        }}
        error={error}
        autoFocus
      />
    </Dialog>
  )
}
