<script setup lang="ts">
import { type TodoItem } from '@/core'
import { deleteTodoItem } from '../store';

const props = defineProps<{ todoItem: TodoItem }>()

const emit = defineEmits(['executed'])

const btns = [
  {
    text: '删除',
    click: async () => {
      if (confirm(`确定要删除吗?`)) {
        await deleteTodoItem(props.todoItem.entity_id)
      }
      emit('executed', props.todoItem.entity_id)
    }
  }
]
</script>
<template>
  <ul class="py-2 flex flex-col">
    <li v-for="btn of btns" :key="btn.text" @click="btn.click"
      class="py-2 px-4 hover:bg-green-50 flex items-center cursor-pointer">{{ btn.text }}</li>
  </ul>
</template>
