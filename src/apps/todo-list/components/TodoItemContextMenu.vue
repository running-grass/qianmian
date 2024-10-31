<script setup lang="ts">
import { type TodoItem } from '@/core'
import { changeTodoItemDone, deleteTodoItem } from '../store'

const props = defineProps<{ todoItem: TodoItem }>()

const emit = defineEmits(['executed'])

const btns = [
  {
    text: '删除',
    disabled: false,
    click: async () => {
      if (confirm(`确定要删除吗?`)) {
        await deleteTodoItem(props.todoItem.entity_id)
      }
      emit('executed', props.todoItem.entity_id)
    }
  },
  {
    text: '放弃',
    disabled: props.todoItem.done,
    click: async () => {
      if (confirm(`确定要放弃吗?`)) {
        await changeTodoItemDone(props.todoItem.entity_id, true, 'abandoned')
      }
      emit('executed', props.todoItem.entity_id)
    }
  }
]
</script>
<template>
  <ul class="py-2 flex flex-col">
    <li
      v-for="btn of btns"
      :key="btn.text"
      @click="btn.click"
      class="py-2 px-4 hover:bg-green-50 flex items-center cursor-pointer"
      :class="btn.disabled ? 'text-gray-400 pointer-events-none' : ''"
    >
      {{ btn.text }}
    </li>
  </ul>
</template>
