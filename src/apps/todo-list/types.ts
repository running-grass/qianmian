import type { AttributeDataType } from '@/core'
import type { SimpleEntityAttribute } from '@/core/type'

export type SimpleEntityAttributeFor<T extends AttributeDataType> =
  | (SimpleEntityAttribute & { data: T | undefined })
  | undefined

export type SimpleEntityAttributeForBoolean = SimpleEntityAttributeFor<boolean>
export type SimpleEntityAttributeForDate = SimpleEntityAttributeFor<Date>
