import { useTranslation } from 'react-i18next'
import { Box, Icon, Text, WrapBox } from '@gnome-ui/react'
import { Document, Folder } from '@gnome-ui/icons'
import { useNpmPackageVersionFiles } from '@api-hooks/npm'
import { SectionCard } from '@/components/SectionCard'
import type { UnpkgFile } from 'npmjs-api-client'
import { useFormatters } from '@/hooks/useFormatters'

interface FilesSectionProps {
  name: string
  version: string
}

function flattenFiles(node: UnpkgFile): UnpkgFile[] {
  if (node.type === 'file') return [node]
  return (node.files ?? []).flatMap(flattenFiles)
}

export function FilesSection({ name, version }: FilesSectionProps) {
  const { t } = useTranslation()
  const { formatBytes } = useFormatters()
  const { data, isPending, error } = useNpmPackageVersionFiles(name, version, {
    enabled: name.length > 0 && version.length > 0,
  })

  const files = data ? flattenFiles(data).sort((a, b) => (b.size ?? 0) - (a.size ?? 0)) : []
  const dirs = new Set(files.map(f => f.path.split('/').slice(0, -1).join('/')).filter(Boolean))

  const title = data
    ? `${t('packageDetail.files')} (${files.length})`
    : t('packageDetail.files')

  return (
    <SectionCard title={title} isLoading={isPending} error={error as Error | null}>
      {data && files.length === 0 && (
        <Text color="dim">{t('packageDetail.noFiles')}</Text>
      )}
      {files.length > 0 && (
        <Box orientation="vertical" spacing={4}>
          {dirs.size > 0 && (
            <WrapBox childSpacing={6} align="center" style={{ marginBottom: '0.5rem' }}>
              {[...dirs].sort().map(dir => (
                <WrapBox key={dir} align="center" childSpacing={4}>
                  <Icon icon={Folder} size="sm" />
                  <Text variant="caption" color="dim" style={{ fontFamily: 'monospace' }}>{dir}/</Text>
                </WrapBox>
              ))}
            </WrapBox>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.25rem' }}>
            {files.map(f => (
              <WrapBox key={f.path} align="center" childSpacing={6} style={{ minWidth: 0 }}>
                <Icon icon={Document} size="sm" />
                <Text
                  variant="caption"
                  style={{ fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}
                >
                  {f.path}
                </Text>
                {f.size != null && (
                  <Text variant="caption" color="dim" style={{ whiteSpace: 'nowrap', flexShrink: 0 }}>
                    {formatBytes(f.size)}
                  </Text>
                )}
              </WrapBox>
            ))}
          </div>
        </Box>
      )}
    </SectionCard>
  )
}
