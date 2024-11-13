<script setup lang="ts">
import { computed, ref, useTemplateRef, watch } from 'vue'
import {
  allTodoList,
  changeBelongListTo,
  changeTodoItemAttribute,
  changeTodoItemDone,
  deleteTodoItem
} from '../store'
import {
  attributePriority,
  attributeSchduledRepeat,
  attributeSchduledStart,
  attributeTag,
  ScheduledRepeatUnitEnums,
  ScheduledRepeatValidator,
  useAutoSaveEntity,
  type TodoItem,
  type TodoItemPriority
} from '@/core'
import { getDoneInputClass } from '../util'
import { StringRecordId } from 'surrealdb'
import DatePicker from 'primevue/datepicker';
import Popover from 'primevue/popover'
import ToggleSwitch from 'primevue/toggleswitch'
import SelectButton from 'primevue/selectbutton'
import InputNumber from 'primevue/inputnumber';
import Button from 'primevue/button'
import { myDayjs } from '@/plugins/dayjs'

const emit = defineEmits(['delete', 'update'])

const modelValue = defineModel<TodoItem>({ required: true })

const currentScheduleStart = computed(() => {
  if (!modelValue.value.scheduled_start) return '无日期'
  return myDayjs(modelValue.value.scheduled_start).format('YYYY-MM-DD')
})

const selectedPriority = ref<TodoItemPriority | ''>(modelValue.value.priority ?? '')

watch(modelValue, () => {
  selectedPriority.value = modelValue.value.priority ?? ''
})

const todoItemModel = ref<Partial<TodoItem>>({ ...modelValue.value })

/**
 * 删除当前选择的待办事项
 *
 * 如果当前未选择待办事项，则什么也不做
 */
async function deleteSelectedTodoItem() {
  await deleteTodoItem(modelValue.value.entity_id)
  emit('delete', modelValue.value.entity_id)
}

const { triggerInput, triggerChange } = useAutoSaveEntity(modelValue)

const localBelongs = ref<string | undefined>(
  modelValue.value.belong_to?.id?.toString() ?? undefined
)

async function changeBelongList(nid: string | undefined) {
  await changeBelongListTo(modelValue.value.entity_id, nid ? new StringRecordId(nid) : undefined)
  emit('update', modelValue.value.entity_id)
}

async function changePriority($event: TodoItemPriority | '') {
  console.log('changePriority', $event)
  await changeTodoItemAttribute(
    modelValue.value.entity_id,
    attributePriority.value.id,
    $event ? $event : undefined
  )
  emit('update', modelValue.value.entity_id)
}


async function changeTodoItemDoneLocal() {
  console.log('done', modelValue.value.done)
  await changeTodoItemDone(modelValue.value, modelValue.value.done)
  emit('update', modelValue.value.entity_id)
}

async function changeTags() {
  await changeTodoItemAttribute(
    modelValue.value.entity_id,
    attributeTag.value.id,
    todoItemModel.value.tags
  )
  emit('update', modelValue.value.entity_id)
}


// 时间处理弹窗
const op = useTemplateRef('op')
const toggle = (event: Event) => {
  op.value?.toggle(event);
}
const scheduleDate = ref<Date | undefined>(modelValue.value.scheduled_start)

function unitToLabel(unit: typeof ScheduledRepeatValidator.shape.unit._type): string {
  switch (unit) {
    case 'days':
      return '天'
    case 'weeks':
      return '周'
    case 'months':
      return '月'
    case 'years':
      return '年'
  }
}

const units = ScheduledRepeatUnitEnums.map((item) => {
  return {
    label: unitToLabel(item),
    value: item
  }
})
// 重复
const hasRepeat = ref(!!modelValue.value.scheduled_repeat)
const repeatModel = ref(ScheduledRepeatValidator.parse(modelValue.value.scheduled_repeat ?? {}))

async function saveSchedule() {
  console.log(typeof scheduleDate.value)
  if (scheduleDate.value !== modelValue.value.scheduled_start) {
    console.log('scheduleDate', scheduleDate.value)
    await changeTodoItemAttribute(
      modelValue.value.entity_id,
      attributeSchduledStart.value.id,
      scheduleDate.value ?? undefined
    )
  }
  if (!hasRepeat.value && modelValue.value.scheduled_repeat) {
    // 关闭重复
    await changeTodoItemAttribute(
      modelValue.value.entity_id,
      attributeSchduledRepeat.value.id,
      undefined
    )
  } else if (hasRepeat.value && repeatModel.value != modelValue.value.scheduled_repeat) {
    // 修改重复
    await changeTodoItemAttribute(
      modelValue.value.entity_id,
      attributeSchduledRepeat.value.id,
      repeatModel.value
    )
  }

  op.value?.hide()
  emit('update', modelValue.value.entity_id)
}

watch(scheduleDate, () => {
  if (!scheduleDate.value) {
    hasRepeat.value = false
  }
})
</script>

<template>
  <section class="w-full h-full p-2 flex flex-col todo-item-detail">
    <header class="flex items-center gap-2 flex-wrap">
      <Checkbox :class="getDoneInputClass(modelValue)" v-model="modelValue.done" @change="changeTodoItemDoneLocal"
        binary>
      </Checkbox>
      <el-select v-model="selectedPriority" size="small" class="!w-24 mr-2" clearable @change="changePriority"
        placeholder="无优先级" :teleported="false">
        <el-option v-for="item in ['', '低', '中', '高']" :key="item" :label="(item ? item : '无') + '优先级'" :value="item" />
      </el-select>
      <span class="text-sm hover:bg-gray-200 block px-2 border-r-2 cursor-pointer" @click="toggle">{{
        currentScheduleStart }}</span>
      <Popover ref="op">
        <DatePicker inline showButtonBar v-model="scheduleDate" />
        <div class="form-row">
          <span>间隔重复</span>
          <ToggleSwitch v-model="hasRepeat" />
        </div>
        <section v-if="hasRepeat">
          <div class="flex items-center">
            <span class="mr-2">每</span>
            <InputNumber v-model="repeatModel.quantity" :min="1" :max="100" class="w-12" />
            <SelectButton v-model="repeatModel.unit" :options="units" optionLabel="label" optionValue="value" />
          </div>
        </section>
        <div class="form-row">
          <Button label="保存" @click="saveSchedule"></Button>
          <Button label="取消" @click="op?.hide()" severity="secondary"></Button>
        </div>
      </Popover>

      <el-select v-model="todoItemModel.tags" multiple placeholder="标签" class="!w-24" @change="changeTags">
        <el-option v-for="item in attributeTag.enums" :key="item" :label="item" :value="item" />
      </el-select>
      <!-- <el-date-picker v-model="currentDeadline" type="date" size="small" placeholder="截止时间" class="!w-44"
        @change="changeDeadline" :teleported="false" /> -->
    </header>
    <el-input tabindex="1" class="my-4" type="text" v-model="modelValue.title" @input="triggerInput"
      @change="triggerChange" />

    <el-input type="textarea" tabindex="2" @input="triggerInput" @change="triggerChange"
      class="textarea textarea-bordered flex-1 w-full resize-none" v-model="modelValue.content" />
    <footer class="mt-4 justify-between items-center">
      <el-select v-model="localBelongs" size="small" clearable placeholder="Select" style="width: 240px"
        @change="changeBelongList">
        <el-option v-for="item in allTodoList" :key="item.entity_id.toString()" :label="item.title"
          :value="item.entity_id.toString()" />
      </el-select>
      <el-button class="ml-4" type="danger" @click="deleteSelectedTodoItem">删除</el-button>
    </footer>
  </section>
</template>
<style scoped>
.todo-item-detail :deep(.el-textarea__inner) {
  height: 100%;
}

.form-row {
  @apply mt-2 flex justify-between;
}
</style>
