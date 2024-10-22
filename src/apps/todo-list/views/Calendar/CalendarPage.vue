<script setup lang="ts">
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import { getDb, todoItemView, useMobile, type TodoItem } from '@/core';
import { myDayjs } from '@/plugins/dayjs';
import type { CalendarOptions, EventInput } from '@fullcalendar/core/index.js';
import zhLocale from '@fullcalendar/core/locales/zh-cn';
import { computed, ref } from 'vue';
import TodoItemDetail from '../../components/TodoItemDetail.vue';

const isMobileScreen = useMobile()
const mobileDrawer = ref(false)

const selectedTodoItem = ref<TodoItem | null>(null)

const db = await getDb()

type TodoItemEventInput = EventInput & {
  todoItem: TodoItem
}
const events = ref<TodoItemEventInput[]>([])
async function refreshtodoItems() {
  const [list] = await db.query<[TodoItem[]]>(`SELECT * FROM ${todoItemView.tb} WHERE done = false`, {})
  events.value = list.filter(it => it.scheduled_start).map(item => {
    return {
      title: item.title,
      todoItem: item,
      start: myDayjs(item.scheduled_start).format('YYYY-MM-DD'),
      end: myDayjs(item.scheduled_end ?? item.scheduled_start).format('YYYY-MM-DD'), // item.scheduled_end ?? item.scheduled_end!
    }
  })
}

refreshtodoItems()

const calendarOptions = computed<CalendarOptions>(() => ({
  plugins: [dayGridPlugin, interactionPlugin],
  timeZone: 'local',
  locale: zhLocale,
  firstDay: 1,
  initialView: 'dayGridMonth',
  editable: true,
  selectable: true,
  height: '100%',
  // 待办事项相关
  events: events.value,
  eventClick: function (info) {
    const item = info.event.extendedProps.todoItem
    selectedTodoItem.value = item
    console.log(item)
    mobileDrawer.value = true
  }
}))

</script>
<template>
  <section class="p-2 w-full h-full">
    <FullCalendar :options="calendarOptions">
      <!-- <template v-slot:eventContent='arg'>
      <b>{{ arg.event.title }}</b>
    </template> -->
    </FullCalendar>
  </section>
  <el-drawer v-if="selectedTodoItem" modal-class="todo-item-detail-drawer" v-model="mobileDrawer"
    :size="isMobileScreen ? '90%' : '40%'" :with-header="false" destroy-on-close
    :direction="isMobileScreen ? 'btt' : 'rtl'" @close="refreshtodoItems">
    <TodoItemDetail v-if="selectedTodoItem" v-model="selectedTodoItem" :key="selectedTodoItem?.entity_id.toString()" />
  </el-drawer>
</template>
