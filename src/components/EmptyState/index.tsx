import { StatusPage, Button, Icon } from '@gnome-ui/react'
import { Add, StarOutline } from '@gnome-ui/icons'

interface EmptyStateProps {
  onAddClick: () => void
}

export function EmptyState({ onAddClick }: EmptyStateProps) {
  return (
    <StatusPage
      icon={StarOutline}
      title="No packages yet"
      description="Add your favourite npm packages to track their metrics at a glance."
    >
      <Button variant="suggested" onClick={onAddClick} leadingIcon={<Icon icon={Add} />}>
        Add package
      </Button>
    </StatusPage>
  )
}
