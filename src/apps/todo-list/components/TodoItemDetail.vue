<script setup lang="ts">
import { ref, watch } from 'vue'
import { allTodoList, changeTodoItemAttribute, changeTodoItemDone, deleteTodoItem, getDoneInputClass, refreshtodoItems } from '../store'
import {
  attributePriority,
  attributeSchduledStart,
  getDb,
  relationBelongToTodoList,
  StringRecordId,
  useAutoSaveEntity,
  type TodoItem,
  type TodoItemPriority
} from '@/core'

const emit = defineEmits(['delete'])


const modelValue = defineModel<TodoItem>({ required: true })


const currentScheduleStart = ref<Date | ''>(modelValue.value.scheduled_start ?? '')


const selectedPriority = ref<TodoItemPriority | ''>(modelValue.value.priority ?? '')

watch(modelValue, () => {
  currentScheduleStart.value = modelValue.value.scheduled_start ?? ''
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
  const db = await getDb()

  await db.query('DELETE FROM entity_relations WHERE in = $entity AND relation = $relation', {
    entity: modelValue.value.entity_id,
    relation: relationBelongToTodoList.value.id
  })

  await db.relate(modelValue.value.entity_id, 'entity_relations', new StringRecordId(nid), {
    relation: relationBelongToTodoList.value.id
  })

  refreshtodoItems()
}
</script>
<template>
  <section class="w-full h-full p-2 flex flex-col todo-item-detail">
    <header class="flex items-center gap-2">
      <input type="checkbox" :class="getDoneInputClass(modelValue)" :checked="modelValue.done ?? false" size="large"
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
    </header>
    <el-input tabindex="1" class="mb-4" type="text" v-model="modelValue.title" @input="triggerInput"
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
