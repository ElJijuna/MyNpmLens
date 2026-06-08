import { useTranslation } from 'react-i18next'
import { useNavigate } from '@tanstack/react-router'
import { Avatar, Box, Button, Card, ContributionGraph, Icon, Text, WrapBox } from '@gnome-ui/react'
import { Delete, Star } from '@gnome-ui/icons'
import { DashboardGrid } from '@gnome-ui/layout/components/DashboardGrid'
import { StatCard } from '@gnome-ui/layout/components/StatCard'
import { useGhCurrentUser, useGhUserContributionMap, useGhUserRepos } from '@api-hooks/gh'
import type { GitHubRepository } from 'gh-api-client'
import { useAuth } from '@/modules/auth/AuthProvider'
import { useSignOut } from '@/modules/auth/hooks'

export function ProfilePage() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const navigate = useNavigate()
  const signOut = useSignOut()

  const { data: ghUser, isPending: userPending } = useGhCurrentUser({
    enabled: !!user?.githubToken,
  })

  const login = ghUser?.login ?? ''
  const hookOpts = { enabled: !!login && !!user?.githubToken }

  const { data: contributions } = useGhUserContributionMap(login, {}, hookOpts)
  const { data: reposData } = useGhUserRepos(login, { sort: 'pushed', per_page: 6, type: 'public' }, hookOpts)

  if (!user) return null

  const repos = (reposData?.values ?? []).filter((r) => !r.fork)
  const memberYear = ghUser?.created_at ? new Date(ghUser.created_at).getFullYear() : null

  function handleSignOut() {
    signOut.mutate(undefined, { onSuccess: () => navigate({ to: '/' }) })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <main className="page-content">
        <Box spacing={24}>
          <WrapBox justify="space-between" align="start">
            <Box orientation="horizontal" spacing={16} style={{ alignItems: 'flex-start' }}>
              <Avatar src={user.photoURL ?? undefined} name={user.displayName ?? user.email ?? '?'} size="lg" />
              <Box spacing={4}>
                <Text variant="heading">{ghUser?.name ?? user.displayName ?? user.email}</Text>
                {ghUser?.login && (
                  <Text variant="caption" color="dim">
                    @{ghUser.login}
                  </Text>
                )}
                {ghUser?.bio && <Text>{ghUser.bio}</Text>}
                <WrapBox childSpacing={12}>
                  {ghUser?.company && (
                    <Text variant="caption" color="dim">
                      {ghUser.company}
                    </Text>
                  )}
                  {ghUser?.location && (
                    <Text variant="caption" color="dim">
                      {ghUser.location}
                    </Text>
                  )}
                  {memberYear && (
                    <Text variant="caption" color="dim">
                      {t('profile.memberSince', { year: memberYear })}
                    </Text>
                  )}
                </WrapBox>
              </Box>
            </Box>
            <Button variant="destructive" size="sm" leadingIcon={<Icon icon={Delete} />} onClick={handleSignOut} disabled={signOut.isPending}>
              {t('profile.signOut')}
            </Button>
          </WrapBox>

          <DashboardGrid layout="grid" columns={{ sm: 2, md: 4 }} gap="sm">
            <DashboardGrid.Item>
              <StatCard label={t('profile.repositories')} value={ghUser?.public_repos ?? 0} loading={userPending} />
            </DashboardGrid.Item>
            <DashboardGrid.Item>
              <StatCard label={t('profile.gists')} value={ghUser?.public_gists ?? 0} loading={userPending} />
            </DashboardGrid.Item>
            <DashboardGrid.Item>
              <StatCard label={t('profile.followers')} value={ghUser?.followers ?? 0} loading={userPending} />
            </DashboardGrid.Item>
            <DashboardGrid.Item>
              <StatCard label={t('profile.following')} value={ghUser?.following ?? 0} loading={userPending} />
            </DashboardGrid.Item>
          </DashboardGrid>

          {contributions && (
            <Card padding="md">
              <Box spacing={12}>
                <Text variant="heading">
                  {contributions.totalContributions.toLocaleString()} {t('profile.contributions')}
                </Text>
                <ContributionGraph data={contributions.weeks.flatMap((week) => week.contributionDays.map((day) => ({ date: day.date, count: day.contributionCount })))} />
              </Box>
            </Card>
          )}

          {repos.length > 0 && (
            <Box spacing={12}>
              <Text variant="heading">{t('profile.recentRepos')}</Text>
              <DashboardGrid layout="grid" columns={{ sm: 1, md: 2, lg: 3 }} gap="md">
                {repos.map((repo) => (
                  <DashboardGrid.Item key={repo.id}>
                    <RepoCard repo={repo} />
                  </DashboardGrid.Item>
                ))}
              </DashboardGrid>
            </Box>
          )}
        </Box>
      </main>
    </div>
  )
}

function RepoCard({ repo }: { repo: GitHubRepository }) {
  return (
    <Card padding="md">
      <Box spacing={6}>
        <WrapBox justify="space-between" align="start" childSpacing={8}>
          <a href={repo.html_url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit', minWidth: 0 }}>
            <Text variant="body" style={{ wordBreak: 'break-word' }}>
              {repo.name}
            </Text>
          </a>
          {repo.stargazers_count > 0 && (
            <WrapBox childSpacing={4} align="center" style={{ flexShrink: 0 }}>
              <Icon icon={Star} size="sm" />
              <Text variant="caption">{repo.stargazers_count.toLocaleString()}</Text>
            </WrapBox>
          )}
        </WrapBox>
        {repo.description && (
          <Text
            variant="caption"
            color="dim"
            style={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {repo.description}
          </Text>
        )}
        {repo.language && (
          <Text variant="caption" color="dim">
            {repo.language}
          </Text>
        )}
      </Box>
    </Card>
  )
}
