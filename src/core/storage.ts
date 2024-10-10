import { useLocalStorage } from '@vueuse/core'
import { SURREAL_TOKEN_KEY } from './const'

export const token = useLocalStorage<string | null>(SURREAL_TOKEN_KEY, null)
