import { getDb } from '../db'
import { AccountValidator, type Account } from '../table'

export async function getAccountInfo(): Promise<Account> {
  const db = await getDb()
  const info = await db.info<Account>()
  if (!info) throw new Error('Failed to get account info')
  return AccountValidator.parse(info)
}
