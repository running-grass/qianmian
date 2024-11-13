import { initAccountStore } from './account'
import { initBuiltInAttributes } from './attribute'
import { initBuiltInIdentities } from './identity'
import { initBuiltInRelations } from './relation'

export * from './identity'
export * from './attribute'
export * from './relation'

export async function initBuiltInData() {
  await Promise.all([
    initAccountStore(),
    initBuiltInIdentities().then(async () => {
      // 需要在身份初始化完成后再初始化关系
      await initBuiltInRelations()
    }),
    initBuiltInAttributes()
  ])
}
