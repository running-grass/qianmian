//./plugins/posthog
import { getDb, IS_PROD, type Account } from '@/core'
import { surrealdbAuthed$ } from '@/core/subjects/surrealdbSubject'
import posthog from 'posthog-js'
import type { App } from 'vue'

export default {
  install(app: App) {
    // 只在prod环境下打开posthugj
    if (IS_PROD) {
      app.config.globalProperties.$posthog = posthog.init(
        'phc_C2YmvPipYXiI2NsyP1Vh0P4RUEtH5Qee31xVW0bO5Eb',
        {
          api_host: 'https://us.i.posthog.com'
        }
      )
      surrealdbAuthed$.subscribe(async (authed) => {
        if (authed) {
          const db = await getDb()
          const user = await db.info<Account>()
          posthog.identify(user!.id.toString(), {
            username: user!.username
          })
        }
      })
    } else {
      app.config.globalProperties.$posthog = posthog
    }
  }
}
