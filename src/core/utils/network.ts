import { useIntervalFn } from '@vueuse/core'
import { ref, watch, type Ref } from 'vue'
import { delayResolve } from './time'
import type Surreal from 'surrealdb'
import { useNetwork } from '@vueuse/core'

const { isOnline } = useNetwork()

// 全局状态，用于管理轮询的状态
const _dbConnected = ref(true)
let intervalFn: ReturnType<typeof useIntervalFn> | null = null

export function useDbConnected(db: Surreal): Ref<boolean> {
  if (!intervalFn) {
    intervalFn = useIntervalFn(
      async () => {
        const pinged = isOnline && (await Promise.race([db.ping(), delayResolve(1000, false)]))
        _dbConnected.value = pinged
      },
      3000,
      { immediate: false }
    )

    watch(isOnline, (online) => {
      if (!online) {
        _dbConnected.value = false
      }
    })
  }

  if (intervalFn) {
    intervalFn.resume()
  }

  return _dbConnected
}
