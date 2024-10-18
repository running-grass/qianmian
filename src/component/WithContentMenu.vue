<script setup lang="ts">
import type { TodoList } from '@/core';
import { useMouse } from '@vueuse/core';
import { reactive, ref } from 'vue';


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
const todoListContextMenuTarget = ref<TodoList>()
const todoListContextMenuVisible = ref(false)
const todoListContentMenuPosition = reactive({ left: '0', top: '0', padding: 0 })
const { x, y } = useMouse()

const openTodoListContentMenu = (todoList: TodoList) => {
  todoListContentMenuPosition.left = x.value + 'px'
  todoListContentMenuPosition.top = y.value + 'px'

  todoListContextMenuTarget.value = todoList
  todoListContextMenuVisible.value = true
}

const closeTodoListContentMenu = () => {
  todoListContextMenuVisible.value = false
  todoListContextMenuTarget.value = undefined
}

</script>
<template>
  <slot @context-menu="openTodoListContentMenu"></slot>

  <el-popover v-if="todoListContextMenuTarget" :visible="todoListContextMenuVisible" virtual-triggering
    placement="right" :popper-style="todoListContentMenuPosition" :show-arrow="false">
    <ul class="py-2 flex flex-col">
      <li v-for="btn of btns" :key="btn.text" @click="btn.click"
        class="py-2 px-4 hover:bg-green-50 flex items-center cursor-pointer">{{ btn.text }}</li>
    </ul>
  </el-popover>
</template>
