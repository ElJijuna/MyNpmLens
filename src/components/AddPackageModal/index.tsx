import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Dialog, SearchBar, Banner } from '@gnome-ui/react'

interface Suggestion { id: string; label: string }
import { parseNpmUrl } from '@/modules/npm/domain'
import { useAddFavorite, useFavorites } from '@/modules/npm/hooks'
import { Analytics } from '@/lib/analytics'
import { useNpmClient, useNpmSearch } from '@api-hooks/npm'
import { useDebouncedValue } from '@tanstack/react-pacer'
import { NpmApiError } from 'npmjs-api-client'

interface AddPackageModalProps {
  open: boolean
  onClose: () => void
}

export function AddPackageModal({ open, onClose }: AddPackageModalProps) {
  const { t } = useTranslation()
  const npmClient = useNpmClient()
  const [input, setInput] = useState('')
  const [error, setError] = useState<string | undefined>()
  const [isValidating, setIsValidating] = useState(false)
  const [suppressSuggestions, setSuppressSuggestions] = useState(false)
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
      setError(t('addPackage.errorInvalid'))
      return
    }

    if (favorites.some((f) => f.name === name)) {
      setError(t('addPackage.errorAlreadyAdded', { name }))
      return
    }

    setIsValidating(true)
    try {
      await npmClient.package(name).get()
    } catch (err) {
      if (err instanceof NpmApiError && err.status === 404) {
        setError(t('addPackage.errorNotFound', { name }))
      } else {
        setError(t('addPackage.errorNetwork'))
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
    setSuppressSuggestions(false)
    onClose()
  }

  const isBusy = isValidating || addFavorite.isPending

  return (
    <Dialog
      open={open}
      title={t('addPackage.title')}
      onClose={handleClose}
      buttons={[
        { label: t('addPackage.cancel'), variant: 'default', onClick: handleClose, disabled: isBusy },
        {
          label: isValidating ? t('addPackage.validating') : t('addPackage.add'),
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
        placeholder={t('addPackage.placeholder')}
        onChange={(e) => {
          setInput(e.target.value)
          setSuppressSuggestions(false)
          if (error) setError(undefined)
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && input.trim().length > 0 && !isBusy) void handleConfirm()
        }}
        suggestions={suppressSuggestions ? [] : suggestions}
        onSuggestionSelect={(item) => {
          setInput(item.id)
          setSuppressSuggestions(true)
        }}
        onClear={() => setInput('')}
        loadingSuggestions={searchPending && debouncedInput.trim().length > 1}
        autoCapitalize="none"
      />
      {error && <Banner variant="error">{error}</Banner>}
    </Dialog>
  )
}
