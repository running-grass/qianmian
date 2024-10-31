<script setup lang="ts">
import { computed } from 'vue'
import type { TodoItem } from '@/core'
import { getDoneInputClass, getScheduledStartHtml } from '../util'
import { allTodoList, changeTodoItemDone } from '../store'

const { todoItem } = defineProps<{ todoItem: TodoItem }>()
const emit = defineEmits(['update'])

const timeText = computed(() => getScheduledStartHtml(todoItem))

const todoListThemeColor = computed<string | undefined>(() => {
  const todoListId = todoItem.belong_to[0]?.id
  if (!todoListId) return undefined
  const todoListIdStr = todoListId.toString()
  const todoList = allTodoList.value.find(
    (todoList) => todoList.entity_id.toString() === todoListIdStr
  )
  return todoList?.theme_color
})

async function changeTodoItemDoneLocal(todoItem: TodoItem, done: boolean) {
  await changeTodoItemDone(todoItem.entity_id, done)
  emit('update', todoItem.entity_id)
}
</script>

<template>
  <li
    :data-entity-id="todoItem.entity_id.id.toString()"
    :class="['py-2 pl-0 pr-2 hover:bg-green-50 flex items-center cursor-pointer break-all ']"
  >
    <span class="w-0.5 h-full mr-2" :style="{ backgroundColor: todoListThemeColor }"> &nbsp; </span>

    <input
      type="checkbox"
      :class="getDoneInputClass(todoItem)"
      :checked="todoItem.done"
      @click.stop="changeTodoItemDoneLocal(todoItem, !todoItem.done)"
    />
    <div tabindex="-1" class="flex-1 ml-2 focus:outline-none">
      {{ todoItem.title }}
    </div>
    <div v-if="timeText" class="ml-4" v-html="timeText"></div>
  </li>
</template>
