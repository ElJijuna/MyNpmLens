import { render, screen, fireEvent } from '@testing-library/react'
import { MergeSyncDialog } from '../index'

describe('MergeSyncDialog', () => {
  const addedInGist = [
    { name: 'axios', addedAt: '2025-01-01T00:00:00.000Z' },
    { name: 'lodash', addedAt: '2025-01-02T00:00:00.000Z' },
  ]
  const removedInGist = [
    { name: 'moment', addedAt: '2025-01-03T00:00:00.000Z' },
  ]
  const emptyMaintainers = { addedMaintainersInGist: [], removedMaintainersInGist: [] }

  it('shows packages added on another device', () => {
    render(
      <MergeSyncDialog
        delta={{ addedInGist, removedInGist: [], ...emptyMaintainers }}
        onKeepAll={jest.fn()}
        onReplaceWithLocal={jest.fn()}
      />,
    )
    expect(screen.getByText('+ axios')).toBeInTheDocument()
    expect(screen.getByText('+ lodash')).toBeInTheDocument()
  })

  it('shows packages removed on another device', () => {
    render(
      <MergeSyncDialog
        delta={{ addedInGist: [], removedInGist, ...emptyMaintainers }}
        onKeepAll={jest.fn()}
        onReplaceWithLocal={jest.fn()}
      />,
    )
    expect(screen.getByText('- moment')).toBeInTheDocument()
  })

  it('calls onKeepAll when Keep all is clicked', () => {
    const onKeepAll = jest.fn()
    render(
      <MergeSyncDialog
        delta={{ addedInGist, removedInGist, ...emptyMaintainers }}
        onKeepAll={onKeepAll}
        onReplaceWithLocal={jest.fn()}
      />,
    )
    fireEvent.click(screen.getByText('Keep all'))
    expect(onKeepAll).toHaveBeenCalledTimes(1)
  })

  it('calls onReplaceWithLocal when Replace with current is clicked', () => {
    const onReplaceWithLocal = jest.fn()
    render(
      <MergeSyncDialog
        delta={{ addedInGist, removedInGist, ...emptyMaintainers }}
        onKeepAll={jest.fn()}
        onReplaceWithLocal={onReplaceWithLocal}
      />,
    )
    fireEvent.click(screen.getByText('Replace with current'))
    expect(onReplaceWithLocal).toHaveBeenCalledTimes(1)
  })

  it('shows both sections when there are additions and removals', () => {
    render(
      <MergeSyncDialog
        delta={{ addedInGist, removedInGist, ...emptyMaintainers }}
        onKeepAll={jest.fn()}
        onReplaceWithLocal={jest.fn()}
      />,
    )
    expect(screen.getByText('Packages added on another device')).toBeInTheDocument()
    expect(screen.getByText('Packages removed on another device')).toBeInTheDocument()
  })
})
