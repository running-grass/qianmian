/**
 * 延迟一定时间后返回一个布尔值
 * @param ms 延迟时间，单位毫秒
 * @returns
 */
export function delay(ms: number): Promise<boolean> {
  return delayResolve(ms, true)
}

/**
 * 延迟一定时间后返回一个值
 * @param ms 延迟时间，单位毫秒
 * @param value 返回的值
 * @returns
 */
export function delayResolve<T>(ms: number, value: T): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(value)
    }, ms)
  })
}
