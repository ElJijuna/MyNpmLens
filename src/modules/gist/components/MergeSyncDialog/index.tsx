import { Dialog, Text } from '@gnome-ui/react'
import type { GistDelta } from '@/modules/gist/domain'

interface MergeSyncDialogProps {
  delta: GistDelta
  onKeepAll: () => void
  onReplaceWithLocal: () => void
}

export function MergeSyncDialog({ delta, onKeepAll, onReplaceWithLocal }: MergeSyncDialogProps) {
  const { addedInGist, removedInGist } = delta

  return (
    <Dialog
      open
      title="Changes detected from another device"
      onClose={onReplaceWithLocal}
      buttons={[
        { label: 'Replace with current', variant: 'default', onClick: onReplaceWithLocal },
        { label: 'Keep all', variant: 'suggested', onClick: onKeepAll },
      ]}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {addedInGist.length > 0 && (
          <div>
            <Text variant="caption" color="dim">Added on another device</Text>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.25rem' }}>
              {addedInGist.map((p) => (
                <Text key={p.name} style={{ color: 'var(--gnome-success-color, green)' }}>
                  + {p.name}
                </Text>
              ))}
            </div>
          </div>
        )}

        {removedInGist.length > 0 && (
          <div>
            <Text variant="caption" color="dim">Removed on another device</Text>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.25rem' }}>
              {removedInGist.map((p) => (
                <Text key={p.name} style={{ color: 'var(--gnome-error-color, red)' }}>
                  - {p.name}
                </Text>
              ))}
            </div>
          </div>
        )}
      </div>
    </Dialog>
  )
}
