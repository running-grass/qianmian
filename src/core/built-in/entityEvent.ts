import z, { ZodObject } from 'zod'

type EntityEventSlug = string

/** 完成事件 */
export const doneEventSlug: EntityEventSlug = 'done'

export const DoneEventPayloadZod = z.object({
  type: z.union([z.literal('finished'), z.literal('abandoned')])
})

/** 完成事件的数据 */
export type DoneEventPayload = z.infer<typeof DoneEventPayloadZod> // string

/** 番茄完成事件 */
export const pomodoroEventSlug: EntityEventSlug = 'pomodoro'

/** 番茄完成事件数据 */
export const PomodoroEventPayloadZod = z.object({
  pomodoro_time: z.number().int().positive()
})

/** 番茄完成事件数据类型 */
export type PomodoroEventPayload = z.infer<typeof PomodoroEventPayloadZod>

/** 实体事件检验器 */
export const entityEventValidatorTable: Record<EntityEventSlug, ZodObject<any>> = {
  [doneEventSlug]: DoneEventPayloadZod,
  [pomodoroEventSlug]: PomodoroEventPayloadZod
}
