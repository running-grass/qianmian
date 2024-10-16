import type { Config } from 'release-it'

export default {
  git: {
    commit: true,
    tag: true,
    push: true,
    requireCleanWorkingDir: false,
    commitMessage: 'chore(release): Release ${version}'
  },
  github: {
    release: true
  },

  plugins: {
    '@release-it/conventional-changelog': {
      preset: {
        name: 'writer'
      },
      header: '# 更新日志',
      infile: 'CHANGELOG.md',
      strictSemVer: false,
      ignoreRecommendedBump: true
    }
  }
} satisfies Config
