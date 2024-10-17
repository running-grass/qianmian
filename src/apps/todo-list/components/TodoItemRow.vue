<script setup lang="ts">
import { computed } from 'vue'
import type { TodoItem } from '@/core';
import { getDoneInputClass, getTime } from '../util';
import { changeTodoItemDone } from '../store';

const { todoItem, showList } = defineProps<{ todoItem: TodoItem, showList?: boolean }>()
const emit = defineEmits(['update'])

const timeText = computed(() => getTime(todoItem))

async function changeTodoItemDoneLocal(todoItem: TodoItem, done: boolean) {
  await changeTodoItemDone(todoItem, done)
  emit('update', todoItem.entity_id)
}
</script>

<template>

  <li :data-entity-id="todoItem.entity_id.toString()" :class="[
    'py-2 px-4 hover:bg-green-50 flex items-center cursor-pointer break-all ',
  ]">
    <input type="checkbox" :class="getDoneInputClass(todoItem)" :checked="todoItem.done"
      @click.stop="changeTodoItemDoneLocal(todoItem, !todoItem.done)" />
    <div tabindex="-1" class="flex-1 ml-2 focus:outline-none">
      {{ todoItem.title }}
    </div>
    <div v-if="showList && todoItem.belong_to[0]" class="badge badge-neutral">{{ todoItem.belong_to[0]?.title }}</div>
    <div v-if="timeText" class="ml-4" v-html="timeText">
    </div>
  </li>
</template>
