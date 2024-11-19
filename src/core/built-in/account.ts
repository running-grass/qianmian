import { ref } from 'vue'
import { getAccountInfo } from '../sql/account'
import type { Account } from '../table'

/** 当前用户信息 */
export const currentAccount = ref<Readonly<Account>>(undefined!)
async function fillAccount() {
  currentAccount.value = await getAccountInfo()
}

/** 初始化账号存储 */
export async function initAccountStore() {
  await Promise.all([fillAccount()])
}
