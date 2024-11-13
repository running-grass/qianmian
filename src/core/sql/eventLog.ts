import { entityEventValidatorTable } from '../built-in/entityEvent'
import { getDb } from '../db'
import {
  entityEventLogTable,
  type EntityEventLog,
  type EntityEventLogId,
  type EntityId
} from '../table'

// type TT = keyof typeof entityEventValidatorTable
export async function createEntityEventLog(
  slug: keyof typeof entityEventValidatorTable,
  payload: object = {},
  entityId?: EntityId
): Promise<EntityEventLogId> {
  const db = await getDb()

  const validator = entityEventValidatorTable[slug]
  const payloadParsed = validator.parse(payload)

  console.log({
    entity: entityId,
    slug,
    payload: payloadParsed
  })

  const [res] = await db.insert<EntityEventLog, Partial<EntityEventLog>>(entityEventLogTable, {
    entity: entityId,
    slug,
    payload: payloadParsed
  })

  return res.id
}
