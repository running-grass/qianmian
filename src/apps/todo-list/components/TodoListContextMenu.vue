<script setup lang="ts">
import { type TodoList } from '@/core'

const props = defineProps<{ todoList: TodoList }>()

const emit = defineEmits(['edit', 'delete'])

const btns = [
  {
    text: '编辑',
    click: () => {
      emit('edit', props.todoList)
    }
  },
  {
    text: '删除',
    click: () => {
      emit('delete', props.todoList)
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
