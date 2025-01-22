import { Surreal } from 'surrealdb'
import { useJwt } from '@vueuse/integrations/useJwt'
import { token } from './storage'
import { SURREAL_ENDPOINT } from './const'
import { surrealdbAuthed$ } from './subjects/surrealdbSubject'
import { myDayjs } from '@/plugins/dayjs'
import { useDbConnected } from './utils/network'
import { watch } from 'vue'
import { useNetwork } from '@vueuse/core'

const { isOnline, type } = useNetwork()

let globalDb: Surreal | undefined
let dbP: Promise<Surreal> | null = null

let needAuth = false

export async function getDb(auth: boolean = true): Promise<Surreal> {
  needAuth = auth

  if (globalDb) return globalDb

  if (!dbP) {
    dbP = createDb(auth)
    dbP.finally(() => {
      dbP = null
    })
  }

  return dbP
}

async function createDb(auth: boolean): Promise<Surreal> {
  const db = new Surreal()

  await connectDb(db, auth)

  if (auth) {
    const connected = useDbConnected(db)
    watch(connected, (connected) => {
      if (!connected && isOnline.value) {
        console.debug('SurrealDB reconnecting')
        connectDb(db, auth)
      }
    })

    watch([isOnline, type], ([online]) => {
      if (online) {
        console.debug('SurrealDB reconnecting')
        connectDb(db, auth)
      }
    })

    window.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        if (!connected.value) {
          console.debug('SurrealDB reconnecting')
          connectDb(db, auth)
        }
      }
    })
  }

  globalDb = db

  return db
}

export async function reConnectDb() {
  if (globalDb) {
    await connectDb(globalDb, needAuth)
  }
}

async function connectDb(db: Surreal, auth: boolean) {
  await db.connect(SURREAL_ENDPOINT)

  if (!db.ready) {
    throw new Error('Failed to connect to SurrealDB')
  }

  if (!auth) {
    return db
  }

  const authed = await tryAuth(db)
  if (!authed) {
    token.value = null
    if (location.pathname !== '/account/auth/login') {
      location.href = '/account/auth/login'
    }

    throw new Error('Failed to auth to SurrealDB')
  }

  console.debug('SurrealDB authed')

  return db
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
