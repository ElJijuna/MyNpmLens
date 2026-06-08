import { useCallback } from 'react'
import { useDateTimeFormatter, useNumberFormatter } from '@gnome-ui/react'

export function useFormatters() {
  const numberFormatter = useNumberFormatter()
  const compactNumberFormatter = useNumberFormatter({
    notation: 'compact',
    compactDisplay: 'short',
    maximumFractionDigits: 1,
  })
  const dateFormatter = useDateTimeFormatter({
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
  const percentFormatter = useNumberFormatter({
    style: 'percent',
    maximumFractionDigits: 0,
  })
  const oneDecimalFormatter = useNumberFormatter({
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  })
  const twoDecimalFormatter = useNumberFormatter({
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })

  const formatBytes = useCallback(
    (bytes: number) => {
      if (bytes >= 1024 * 1024) return `${twoDecimalFormatter.format(bytes / (1024 * 1024))} MB`
      if (bytes >= 1024) return `${oneDecimalFormatter.format(bytes / 1024)} kB`
      return `${numberFormatter.format(bytes)} B`
    },
    [numberFormatter, oneDecimalFormatter, twoDecimalFormatter],
  )

  return {
    formatNumber: useCallback((value: number) => numberFormatter.format(value), [numberFormatter]),
    formatCompactNumber: useCallback((value: number) => compactNumberFormatter.format(value), [compactNumberFormatter]),
    formatDate: useCallback((value: string | number | Date) => dateFormatter.format(new Date(value)), [dateFormatter]),
    formatPercent: useCallback((value: number) => percentFormatter.format(value), [percentFormatter]),
    formatBytes,
  }
}
