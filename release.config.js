/**
 * Semantic Release configuration.
 * Conventional Commits → automatic version bump + CHANGELOG + GitHub Release.
 *
 * Commit format:  <type>(<scope>): <description>
 * Types that trigger a release:
 *   feat       → minor bump
 *   fix        → patch bump
 *   perf       → patch bump
 *   BREAKING CHANGE (footer) or feat! / fix! → major bump
 */

/** @type {import('semantic-release').GlobalConfig} */
export default {
  branches: ['main'],
  plugins: [
    [
      '@semantic-release/commit-analyzer',
      {
        preset: 'conventionalcommits',
        releaseRules: [
          { type: 'feat', release: 'minor' },
          { type: 'fix', release: 'patch' },
          { type: 'perf', release: 'patch' },
          { type: 'refactor', release: 'patch' },
          { type: 'docs', release: false },
          { type: 'chore', release: false },
          { type: 'test', release: false },
          { type: 'style', release: false },
          { type: 'ci', release: false },
        ],
      },
    ],
    [
      '@semantic-release/release-notes-generator',
      {
        preset: 'conventionalcommits',
        presetConfig: {
          types: [
            { type: 'feat', section: 'Features' },
            { type: 'fix', section: 'Bug Fixes' },
            { type: 'perf', section: 'Performance' },
            { type: 'refactor', section: 'Refactoring', hidden: false },
            { type: 'docs', section: 'Documentation', hidden: false },
          ],
        },
      },
    ],
    '@semantic-release/changelog',
    ['@semantic-release/npm', { npmPublish: false }],
    [
      '@semantic-release/git',
      {
        assets: ['CHANGELOG.md', 'package.json'],
        message: 'chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}',
      },
    ],
    '@semantic-release/github',
  ],
}
