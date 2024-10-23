/** 是否是生产环境 */
export const IS_PROD = import.meta.env.PROD

/** 环境变量 */
export const SURREAL_ENDPOINT = import.meta.env.VITE_SURREAL_ENDPOINT

/** 命名空间 */
export const SURREAL_NAMESPACE = import.meta.env.VITE_SURREAL_NAMESPACE

/** 数据库 */
export const SURREAL_DATABASE = import.meta.env.VITE_SURREAL_DATABASE

/** 访问权限 */
export const SURREAL_ACCESS = import.meta.env.VITE_SURREAL_ACCESS

/** 令牌 */
export const SURREAL_TOKEN_KEY = 'surreal_token'

/** 应用版本 */
export const APP_VERSION = __APP_VERSION__

/** 应用最新更新日志 */
export const LATEST_UPDATE_LOG = __APP_LATEST_UPDATE_LOG__
