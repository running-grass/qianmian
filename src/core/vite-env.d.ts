/// <reference types="vite/client" />

interface ImportMetaEnv {
  /**
   * SurrealDB 端点
   * @example 'ws://localhost:8000/rpc'
   * @default ''
   */
  readonly VITE_SURREAL_ENDPOINT: string
  /**
   * SurrealDB 命名空间
   * @example 'production'
   * @default 'production'
   */
  readonly VITE_SURREAL_NAMESPACE: string

  /**
   * SurrealDB 数据库
   * @example 'qianmian'
   * @default 'qianmian'
   */
  readonly VITE_SURREAL_DATABASE: string

  /**
   * SurrealDB 访问权限
   * @example 'front_user'
   * @default 'front_user'
   */
  readonly VITE_SURREAL_ACCESS: string

  // 更多环境变量...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

/** 应用版本 */
declare const __APP_VERSION__: string

/** 最新更新日志 */
declare const __APP_LATEST_UPDATE_LOG__: string
