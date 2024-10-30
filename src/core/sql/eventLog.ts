import { DoneEventPayload, doneEventSlug } from '../built-in/entityEvent'
import { getDb } from '../db'
import {
  entityEventLogTable,
  type EntityEventLog,
  type EntityEventLogId,
  type EntityId
} from '../table'

export async function createEntityEventLog(
  entityId: EntityId,
  slug: string,
  payload: object = {}
): Promise<EntityEventLogId> {
  const db = await getDb()

  let payloadParsed: object
  switch (slug) {
    case doneEventSlug:
      payloadParsed = DoneEventPayload.parse(payload)
      break
    default:
      payloadParsed = payload
      break
  }

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
