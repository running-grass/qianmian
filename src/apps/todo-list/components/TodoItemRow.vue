<script setup lang="ts">
import type { TodoItem } from '@/core';
import { getDoneInputClass, getTime } from '../util';
import { changeTodoItemDone } from '../store';

const { todoItem } = defineProps<{ todoItem: TodoItem }>()
</script>

<template>

  <li :data-entity-id="todoItem.entity_id.toString()" :class="[
    'py-2 px-4 hover:bg-green-50 flex items-center cursor-pointer break-all ',
  ]">
    <input type="checkbox" :class="getDoneInputClass(todoItem)" :checked="todoItem.done"
      @click.stop="changeTodoItemDone(todoItem, !todoItem.done)" />
    <div tabindex="-1" class="flex-1 ml-2 focus:outline-none">
      {{ todoItem.title }}
    </div>
    <div v-html="getTime(todoItem)">
    </div>
  </li>
</template>
