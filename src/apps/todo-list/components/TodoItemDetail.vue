<script setup lang="ts">
import { ref, watch } from 'vue'
import { allTodoList, changeBelongListTo, changeTodoItemAttribute, changeTodoItemDone, deleteTodoItem } from '../store'
import {
  attributeDeadline,
  attributePriority,
  attributeSchduledEnd,
  attributeSchduledStart,
  entityTable,
  useAutoSaveEntity,
  type TodoItem,
  type TodoItemPriority
} from '@/core'
import { getDoneInputClass } from '../util';
import { RecordId } from 'surrealdb';

const emit = defineEmits(['delete'])


const modelValue = defineModel<TodoItem>({ required: true })


const currentScheduleStart = ref<Date | ''>(modelValue.value.scheduled_start ?? '')
const currentScheduleEnd = ref<Date | ''>(modelValue.value.scheduled_end ?? '')
const currentDeadline = ref<Date | ''>(modelValue.value.deadline ?? '')

const selectedPriority = ref<TodoItemPriority | ''>(modelValue.value.priority ?? '')

watch(modelValue, () => {
  console.debug('modelValue', modelValue.value)
  currentScheduleStart.value = modelValue.value.scheduled_start ?? ''
  currentScheduleEnd.value = modelValue.value.scheduled_end ?? ''
  currentDeadline.value = modelValue.value.deadline ?? ''
  selectedPriority.value = modelValue.value.priority ?? ''
})

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
  modelValue.value.belong_to[0]?.id?.toString() ?? undefined
)

async function changeBelongList(nid: string) {
  changeBelongListTo(modelValue.value.entity_id, new RecordId(entityTable.tb, nid))
}
</script>
<template>
  <section class="w-full h-full p-2 flex flex-col todo-item-detail">
    <header class="flex items-center gap-2">
      <input type="checkbox" :class="getDoneInputClass(modelValue)" :checked="modelValue.done ?? false"
        @change="changeTodoItemDone(modelValue, !modelValue.done)" />
      <el-select v-model="selectedPriority" size="small" class="!w-24 mr-2" @change="
        changeTodoItemAttribute(
          modelValue.entity_id,
          attributePriority.id,
          ($event as TodoItemPriority | '') ? $event : null
        )
        " placeholder=" 无优先级">
        <el-option v-for="item in ['', '低', '中', '高']" :key="item" :label="(item ? item : '无') + '优先级'" :value="item" />
      </el-select>
      <el-date-picker v-model="currentScheduleStart" type="datetime" size="small" placeholder="计划开始时间" class="!w-44"
        @change="
          changeTodoItemAttribute(
            modelValue.entity_id,
            attributeSchduledStart.id,
            $event ? $event : null
          )
          " />
      <el-date-picker v-model="currentScheduleEnd" type="datetime" size="small" placeholder="计划结束时间" class="!w-44"
        @change="
          changeTodoItemAttribute(
            modelValue.entity_id,
            attributeSchduledEnd.id,
            $event ? $event : null
          )
          " />

      <el-date-picker v-model="currentDeadline" type="datetime" size="small" placeholder="截止时间" class="!w-44" @change="
        changeTodoItemAttribute(
          modelValue.entity_id,
          attributeDeadline.id,
          $event ? $event : null
        )
        " />
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
</style>
