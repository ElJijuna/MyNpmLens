import { useState } from 'react'
import { Dialog, TextField } from '@gnome-ui/react'
import { parseNpmUrl } from '@/modules/npm/domain'
import { useAddFavorite } from '@/modules/npm/hooks'

interface AddPackageModalProps {
  open: boolean
  onClose: () => void
}

export function AddPackageModal({ open, onClose }: AddPackageModalProps) {
  const [input, setInput] = useState('')
  const [error, setError] = useState<string | undefined>()
  const addFavorite = useAddFavorite()

  function handleConfirm() {
    const name = parseNpmUrl(input)
    if (!name) {
      setError('Enter a valid npm URL (e.g. https://www.npmjs.com/package/react) or package name.')
      return
    }
    addFavorite.mutate(name, {
      onSuccess: () => {
        setInput('')
        setError(undefined)
        onClose()
      },
    })
  }

  function handleClose() {
    setInput('')
    setError(undefined)
    onClose()
  }

  return (
    <Dialog
      open={open}
      title="Add package"
      onClose={handleClose}
      buttons={[
        { label: 'Cancel', variant: 'default', onClick: handleClose },
        {
          label: 'Add',
          variant: 'suggested',
          onClick: handleConfirm,
          disabled: input.trim().length === 0,
        },
      ]}
    >
      <TextField
        label="npm URL or package name"
        placeholder="https://www.npmjs.com/package/react"
        value={input}
        onChange={(e) => {
          setInput(e.target.value)
          if (error) setError(undefined)
        }}
        error={error}
        autoFocus
      />
    </Dialog>
  )
}
