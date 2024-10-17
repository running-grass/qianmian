import { useMediaQuery } from '@vueuse/core'
import { computed } from 'vue'
// 移动端，等同于tailwindcss 的sm
const isPcScreen = useMediaQuery('(min-width: 768px)')
const isMobileScreen = computed(() => !isPcScreen.value)

/** 是否是移动端 */
export function useMobile() {
  return isMobileScreen
}
