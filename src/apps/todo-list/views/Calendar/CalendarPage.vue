<script setup lang="ts">
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import { attributeSchduledEnd, attributeSchduledStart, createEntity, getDb, identityTodoItem, todoItemView, useMobile, type TodoItem } from '@/core';
import { myDayjs } from '@/plugins/dayjs';
import type { CalendarOptions, DateSelectArg, EventInput } from '@fullcalendar/core/index.js';
import zhLocale from '@fullcalendar/core/locales/zh-cn';
import { computed, ref, watch } from 'vue';
import TodoItemDetail from '../../components/TodoItemDetail.vue';
import { changeTodoItemAttribute, deleteTodoItem } from '../../store';
import FloatPopover from '@/component/FloatPopover.vue';
import { getTodoItemById } from '../../function';

const isMobileScreen = useMobile()
const detailPanelVisible = ref(false)

const selectedTodoItem = ref<TodoItem | null>(null)


type TodoItemEventInput = EventInput & {
  todoItem: TodoItem
}
const events = ref<TodoItemEventInput[]>([])
async function refreshtodoItems() {
  const db = await getDb()

  const [list] = await db.query<[TodoItem[]]>(`SELECT * FROM ${todoItemView.tb} WHERE done = false`, {})
  events.value = list.filter(it => it.scheduled_start).map(item => {
    return {
      title: item.title,
      todoItem: item,
      start: myDayjs(item.scheduled_start).format('YYYY-MM-DD'),
      end: item.scheduled_end ? myDayjs(item.scheduled_end).format('YYYY-MM-DD') : undefined// item.scheduled_end ?? item.scheduled_end!
    }
  })
}

refreshtodoItems()

const createMode = ref(false)

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
    detailPanelVisible.value = true
  },

  eventDrop: async function (info) {
    const item: TodoItem = info.event.extendedProps.todoItem
    console.info(info.event.title + " was dropped on " + myDayjs(info.event.start).toDate(), info.event.end);

    if (info.event.start) {
      await changeTodoItemAttribute(
        item.entity_id,
        attributeSchduledStart.value.id,
        info.event.start
      )
    }

    if (info.event.end) {
      await changeTodoItemAttribute(
        item.entity_id,
        attributeSchduledEnd.value.id,
        info.event.end
      )
    }
    refreshtodoItems()
  },

  select: async function (info: DateSelectArg) {
    const id = await createEntity(identityTodoItem.value.id, '')
    await changeTodoItemAttribute(
      id,
      attributeSchduledStart.value.id,
      info.start
    )
    if (!myDayjs(info.end).isSame(myDayjs(info.start).add(1, 'day'))) {
      console.debug('select on ', info.start, info.end)
      await changeTodoItemAttribute(
        id,
        attributeSchduledEnd.value.id,
        info.end
      )
    }

    const t = await getTodoItemById(id)

    selectedTodoItem.value = t
    createMode.value = true
    detailPanelVisible.value = true
  }
}))

watch(events, () => {
  console.debug('events', events.value)
})

async function onDetailPanelClose() {
  // 如果创建好以后没有编辑标题，则自动删除该事项
  if (createMode.value) {
    createMode.value = false
    console.log('createMode', createMode.value, selectedTodoItem.value)
    if (selectedTodoItem.value && !selectedTodoItem.value.title) {
      await deleteTodoItem(selectedTodoItem.value.entity_id)
    }
  }
  await refreshtodoItems()
}
</script>
<template>
  <section class="p-2 w-full h-full">
    <FullCalendar :options="calendarOptions">
      <!-- <template v-slot:eventContent='arg'>
      <b>{{ arg.event.title }}</b>
    </template> -->
    </FullCalendar>
  </section>

  <!-- 详情 -->
  <el-drawer v-if="isMobileScreen" modal-class="todo-item-detail-drawer" v-model="detailPanelVisible"
    :size="isMobileScreen ? '90%' : '40%'" :with-header="false" destroy-on-close
    :direction="isMobileScreen ? 'btt' : 'rtl'" @close="onDetailPanelClose">
    <TodoItemDetail v-if="selectedTodoItem" v-model="selectedTodoItem" :key="selectedTodoItem?.entity_id.toString()" />
  </el-drawer>
  <FloatPopover v-else v-model="detailPanelVisible" @close="onDetailPanelClose">
    <TodoItemDetail v-if="selectedTodoItem" v-model="selectedTodoItem" :key="selectedTodoItem?.entity_id.toString()"
      class="min-w-[400px] min-h-[300px] bg-white shadow-xl border" @update="refreshtodoItems"
      @delete="refreshtodoItems" />
  </FloatPopover>

</template>
