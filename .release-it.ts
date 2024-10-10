import type { Config } from 'release-it'

export default {
  git: {
    commit: true,
    tag: true,
    push: true,
    requireCleanWorkingDir: false
  },
  github: {
    release: true
  },
  plugins: {
    '@release-it/conventional-changelog': {
      preset: {
        name: 'angular'
      },
      infile: 'CHANGELOG.md'
    }
  }
} satisfies Config
