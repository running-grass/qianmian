import type { AttributeDataType } from '@/core'
import type { SimpleEntityAttribute } from '@/core/type'

// 泛型函数，用于封装 (SimpleEntityAttribute & { data: boolean | null }) | undefined | null
export type SimpleEntityAttributeFor<T extends AttributeDataType> =
  | (SimpleEntityAttribute & { data: T | null })
  | undefined
  | null

export type SimpleEntityAttributeForBoolean = SimpleEntityAttributeFor<boolean>
export type SimpleEntityAttributeForDate = SimpleEntityAttributeFor<Date>
