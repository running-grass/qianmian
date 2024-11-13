import { Surreal } from 'surrealdb'
import { useJwt } from '@vueuse/integrations/useJwt'
import { token } from './storage'
import { SURREAL_ENDPOINT } from './const'
import { surrealdbAuthed$ } from './subjects/surrealdbSubject'
import { myDayjs } from '@/plugins/dayjs'

let globalDb: Surreal | undefined
let dbP: Promise<Surreal> | null = null

export async function getDb(auth: boolean = true): Promise<Surreal> {
  if (globalDb) return globalDb

  if (!dbP) dbP = createDb(auth)
  return dbP
}

async function createDb(auth: boolean): Promise<Surreal> {
  try {
    const db = new Surreal()

    await db.connect(SURREAL_ENDPOINT)

    if (!db.ready) {
      throw new Error('Failed to connect to SurrealDB')
    }

    if (auth) {
      const authed = await tryAuth(db)

      if (!authed) {
        token.value = null
        if (location.pathname !== '/account/auth/login') {
          location.href = '/account/auth/login'
        }
        throw new Error('Failed to auth to SurrealDB')
      } else {
        console.debug('SurrealDB authed')
      }
    }

    // 自定关闭连接
    window.addEventListener('beforeunload', async () => {
      await db.close()
    })

    globalDb = db
    return db
  } catch (err) {
    console.error('Failed to connect to SurrealDB:', err)
    throw err
  } finally {
    dbP = null
  }
}

/** 确保已经登录 */
export async function ensureAuthed() {
  await getDb(true)
}

async function tryAuth(db: Surreal): Promise<boolean> {
  if (!db.ready) {
    throw new Error('Failed to connect to SurrealDB')
  }

  if (!token.value) return false
  const { payload } = useJwt(token.value)
  const exp = payload.value?.exp

  if (!exp) return false
  if (myDayjs.unix(exp).isBefore(myDayjs())) return false
  try {
    await db.authenticate(token.value)
  } catch (err) {
    console.debug('登录失败')
    surrealdbAuthed$.next(false)
    return false
  }

  surrealdbAuthed$.next(true)
  return true
}

export async function closeDb(): Promise<void> {
  if (!globalDb) return
  await globalDb.close()
  globalDb = undefined
}
