<script lang="ts" setup>
import { getDb, useMobile, type TodoItem } from '@/core'
import { ref } from 'vue'
import TodoItemRow from '../../components/TodoItemRow.vue'
import TodoItemDetail from '../../components/TodoItemDetail.vue'
import Drawer from 'primevue/drawer';
import ProgressSpinner from 'primevue/progressspinner';
const props = defineProps<{
  keyword?: string
}>()

const keyword = ref<string>(props.keyword ?? '')

const todoItemList = ref<TodoItem[]>([])
const todoItemListLoading = ref(false)
const selectedTodoItem = ref<TodoItem>()
async function doSearch() {
  if (!keyword.value) return
  todoItemListLoading.value = true
  const db = await getDb()
  const [list] = await db.query<[TodoItem[]]>(
    `SELECT * FROM todo_item WHERE title CONTAINS $keyword`,
    {
      keyword: keyword.value
    }
  )
  todoItemListLoading.value = false
  todoItemList.value = list
}

doSearch()

const isMobileScreen = useMobile()
const mobileDrawer = ref(false)

function onClockItemRow(todoItem: TodoItem) {
  selectedTodoItem.value = todoItem
  mobileDrawer.value = true
}
</script>
<template>
  <div class="flex h-full">
    <section class="flex-1 flex flex-col p-4">
      <header class="mb-4 flex gap-2">
        <el-input tabindex="1" class="flex-1" type="text" v-model="keyword" placeholder="输入搜索关键词"
          @keydown.enter="doSearch" />
        <el-button @click="doSearch">搜索</el-button>
      </header>
      <ProgressSpinner v-if="todoItemListLoading" class="self-center" fill="transparent" />
      <el-empty v-else-if="!todoItemList.length" description="没有结果" class="w-full h-full" />
      <ul v-else>
        <TodoItemRow v-for="todoItem of todoItemList" :key="todoItem.entity_id.id.toString()" :todoItem="todoItem"
          show-tags @click="onClockItemRow(todoItem)" :class="[
            ...(selectedTodoItem?.entity_id.id === todoItem.entity_id.id ? ['bg-green-100'] : [])
          ]">
        </TodoItemRow>
      </ul>
    </section>
    <section class="flex-1 p-4" v-if="!isMobileScreen">
      <el-empty v-if="!selectedTodoItem" description="未选择事项" class="w-full h-full" />
      <TodoItemDetail @update="doSearch" v-else v-model="selectedTodoItem"
        :key="selectedTodoItem.entity_id.id.toString()" />
    </section>
  </div>
  <Drawer v-if="isMobileScreen" class="!h-[90%]" v-model:visible="mobileDrawer" position="bottom">
    <TodoItemDetail v-if="selectedTodoItem" v-model="selectedTodoItem" :key="selectedTodoItem?.entity_id.toString()"
      @update="doSearch" />
  </Drawer>
</template>
