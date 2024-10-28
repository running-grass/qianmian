import z from 'zod'
/** 完成事件 */
export const doneEventSlug = 'done'

export const DoneEventPayload = z.object({
  type: z.union([z.literal('finished'), z.literal('abandoned')])
})

/** 完成事件的数据 */
export type DoneEventPayload = z.infer<typeof DoneEventPayload> // string
