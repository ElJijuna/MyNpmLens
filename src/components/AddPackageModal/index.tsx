import { useState } from 'react'
import { Dialog, TextField } from '@gnome-ui/react'
import { parseNpmUrl } from '@/modules/npm/domain'
import { useAddFavorite } from '@/modules/npm/hooks'
import { fetchNpmPackage, ProxyError } from '@/modules/npm/proxy'

interface AddPackageModalProps {
  open: boolean
  onClose: () => void
}

export function AddPackageModal({ open, onClose }: AddPackageModalProps) {
  const [input, setInput] = useState('')
  const [error, setError] = useState<string | undefined>()
  const [isValidating, setIsValidating] = useState(false)
  const addFavorite = useAddFavorite()

  async function handleConfirm() {
    const name = parseNpmUrl(input)
    if (!name) {
      setError(
        'Enter a valid package name (e.g. react, @scope/package) or npm URL (e.g. https://www.npmjs.com/package/react).',
      )
      return
    }

    setIsValidating(true)
    try {
      await fetchNpmPackage(name)
    } catch (err) {
      if (err instanceof ProxyError && err.status === 404) {
        setError(`Package "${name}" was not found on npm.`)
      } else {
        setError('Could not reach the npm registry. Check your connection.')
      }
      setIsValidating(false)
      return
    }
    setIsValidating(false)

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

  const isBusy = isValidating || addFavorite.isPending

  return (
    <Dialog
      open={open}
      title="Add package"
      onClose={handleClose}
      buttons={[
        { label: 'Cancel', variant: 'default', onClick: handleClose, disabled: isBusy },
        {
          label: isValidating ? 'Validating…' : 'Add',
          variant: 'suggested',
          onClick: handleConfirm,
          disabled: input.trim().length === 0 || isBusy,
        },
      ]}
    >
      <TextField
        label="npm URL or package name"
        placeholder="react · @scope/package · https://www.npmjs.com/package/react"
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
