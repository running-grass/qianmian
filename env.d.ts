/// <reference types="vite/client" />
interface ImportMeta {
  url: string
  readonly vitest?: typeof import('vitest')
}
