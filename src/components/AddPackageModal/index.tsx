import { useState } from 'react'
import { Dialog, SearchBar, Banner } from '@gnome-ui/react'

interface Suggestion { id: string; label: string }
import { parseNpmUrl } from '@/modules/npm/domain'
import { useAddFavorite, useFavorites } from '@/modules/npm/hooks'
import { Analytics } from '@/lib/analytics'
import { useNpmSearch } from '@api-hooks/npm'
import { useDebouncedValue } from '@tanstack/react-pacer'
import { NpmClient, NpmApiError } from 'npmjs-api-client'

const npmClient = new NpmClient()

interface AddPackageModalProps {
  open: boolean
  onClose: () => void
}

export function AddPackageModal({ open, onClose }: AddPackageModalProps) {
  const [input, setInput] = useState('')
  const [error, setError] = useState<string | undefined>()
  const [isValidating, setIsValidating] = useState(false)
  const addFavorite = useAddFavorite()
  const { data: favorites = [] } = useFavorites()

  const [debouncedInput] = useDebouncedValue(input, { wait: 300 })
  const { data: searchResult, isPending: searchPending } = useNpmSearch(debouncedInput, {
    enabled: debouncedInput.trim().length > 1,
  })

  const suggestions: Suggestion[] = (searchResult?.objects ?? []).map((o) => ({
    id: o.package.name,
    label: o.package.name,
  }))

  async function handleConfirm() {
    const name = parseNpmUrl(input)
    if (!name) {
      setError(
        'Enter a valid package name (e.g. react, @scope/package) or npm URL (e.g. https://www.npmjs.com/package/react).',
      )
      return
    }

    if (favorites.some((f) => f.name === name)) {
      setError(`"${name}" is already in your list.`)
      return
    }

    setIsValidating(true)
    try {
      await npmClient.package(name).get()
    } catch (err) {
      if (err instanceof NpmApiError && err.status === 404) {
        setError(`Package "${name}" was not found on npm.`)
      } else {
        setError('Could not reach the npm registry. Check your connection.')
      }
      setIsValidating(false)
      return
    }
    setIsValidating(false)

    Analytics.addPackage(name)
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
      <SearchBar
        open={true}
        inline
        value={input}
        placeholder="react · @scope/package · https://www.npmjs.com/package/react"
        onChange={(e) => {
          setInput(e.target.value)
          if (error) setError(undefined)
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && input.trim().length > 0 && !isBusy) void handleConfirm()
        }}
        suggestions={suggestions}
        onSuggestionSelect={(item) => setInput(item.id)}
        loadingSuggestions={searchPending && debouncedInput.trim().length > 1}
      />
      {error && <Banner variant="error">{error}</Banner>}
    </Dialog>
  )
}
