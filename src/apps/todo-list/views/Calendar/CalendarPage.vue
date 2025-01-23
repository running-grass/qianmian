<script setup lang="ts">
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin, { Draggable, type DropArg } from '@fullcalendar/interaction'

import {
  attributeSchduledEnd,
  attributeSchduledStart,
  createEntity,
  entityTable,
  getDb,
  identityTodoItem,
  todoItemView,
  useMobile,
  type TodoItem
} from '@/core'
import { myDayjs } from '@/plugins/dayjs'
import type {
  CalendarOptions,
  DateSelectArg,
  EventClickArg,
  EventDropArg,
  EventInput
} from '@fullcalendar/core/index.js'
import zhLocale from '@fullcalendar/core/locales/zh-cn'
import { computed, nextTick, ref, watch } from 'vue'
import TodoItemDetail from '../../components/TodoItemDetail.vue'
import { allTodoListMap, changeTodoItemAttribute, deleteTodoItem } from '../../store'
import { getTodoItemById } from '../../function'
import { XCircleIcon } from '@heroicons/vue/24/solid'
import { useTemplateRef } from 'vue'
import { RecordId } from 'surrealdb'
import TodoItemRow from '../../components/TodoItemRow.vue'
import Drawer from 'primevue/drawer'
import Popover from 'primevue/popover'

const isMobileScreen = useMobile()
const itemDetailVisible = ref(false)

const selectedTodoItem = ref<TodoItem | null>(null)

const fullCalendar = useTemplateRef('full-calendar')
const draggableElement = useTemplateRef('draggable-element')
type TodoItemEventInput = EventInput & {
  todoItem: TodoItem
}
const events = ref<TodoItemEventInput[]>([])

async function refreshtodoItems() {
  const db = await getDb()

  const [list] = await db.query<[TodoItem[]]>(
    `SELECT * FROM ${todoItemView.tb} WHERE done = false`,
    {}
  )
  events.value = list
    .filter((it) => it.scheduled_start)
    .map((item) => {
      const todoListId = item.belong_to?.id?.toString()
      const todoList = todoListId ? allTodoListMap.value.get(todoListId) : undefined
      return {
        title: item.title,
        todoItem: item,
        backgroundColor: todoList?.theme_color,
        start: myDayjs(item.scheduled_start).format('YYYY-MM-DD'),
        end: item.scheduled_end ? myDayjs(item.scheduled_end).format('YYYY-MM-DD') : undefined // item.scheduled_end ?? item.scheduled_end!
      }
    })
}

refreshtodoItems()

const createMode = ref(false)

async function select(info: DateSelectArg) {

  if (!info.jsEvent) {
    console.error('info no have js event')
    return
  }

  if (itemDetailVisible.value) {
    itemDetailVisible.value = false
    todoItemDetailPopover.value?.hide()

    return
  }
  const id = await createEntity(identityTodoItem.value.id, '')
  await changeTodoItemAttribute(id, attributeSchduledStart.value.id, info.start)
  if (!myDayjs(info.end).isSame(myDayjs(info.start).add(1, 'day'))) {
    await changeTodoItemAttribute(id, attributeSchduledEnd.value.id, info.end)
  }

  const t = await getTodoItemById(id)

  selectedTodoItem.value = t
  createMode.value = true
  itemDetailVisible.value = true

  if (!isMobileScreen.value) {
    todoItemDetailPopover.value?.show(info.jsEvent, info.jsEvent.target)
  }
}

async function eventDrop(info: EventDropArg) {
  const item: TodoItem = info.event.extendedProps.todoItem
  console.info(
    info.event.title + ' was dropped on ' + myDayjs(info.event.start).toDate(),
    info.event.end
  )

  if (info.event.start) {
    await changeTodoItemAttribute(item.entity_id, attributeSchduledStart.value.id, info.event.start)
  }

  if (info.event.end) {
    await changeTodoItemAttribute(item.entity_id, attributeSchduledEnd.value.id, info.event.end)
  }
  refreshtodoItems()
}

const todoItemDetailPopover = useTemplateRef('todoItemDetailPopover')
async function eventClick(info: EventClickArg) {
  if (itemDetailVisible.value) {
    itemDetailVisible.value = false
    todoItemDetailPopover.value?.hide()
    await nextTick()
  }

  todoItemDetailPopover.value?.hide()
  const item = info.event.extendedProps.todoItem
  selectedTodoItem.value = item
  itemDetailVisible.value = true

  if (!isMobileScreen.value) {
    todoItemDetailPopover.value?.show(info.jsEvent, info.jsEvent.target)
  }
}

/** 安排任务面板 */
const scheduleTodoItemPanel = ref(false)
const unScheduleTodoItems = ref<TodoItem[]>([])

async function refreshUnScheduleTodoItems() {
  const db = await getDb()
  const [res] = await db.query<[TodoItem[]]>(
    `SELECT * FROM ${todoItemView.tb} WHERE done = false AND scheduled_start IS NONE AND scheduled_end IS NONE ORDER BY priority_order DESC, created_at DESC`,
  )
  unScheduleTodoItems.value = res
}
const customButtons = {
  scheduleTask: {
    text: '安排任务',
    click: async function () {
      unScheduleTodoItems.value = []
      scheduleTodoItemPanel.value = true

      await refreshUnScheduleTodoItems()
    }
  }
}

watch(scheduleTodoItemPanel, (visible) => {
  let draggable: Draggable | undefined = undefined

  setTimeout(() => {
    if (visible) {
      if (!draggableElement.value) {
        return
      }
      draggable = new Draggable(draggableElement.value, {
        itemSelector: 'li'
      })
    } else {
      draggable && draggable.destroy()
    }

    if (fullCalendar.value) {
      fullCalendar.value.getApi().render()
    }
  }, 40)
})

const calendarOptions = computed<CalendarOptions>(() => ({
  plugins: [dayGridPlugin, interactionPlugin],
  timeZone: 'local',
  locale: zhLocale,
  firstDay: 1,
  initialView: 'dayGridMonth',
  height: '100%',
  // 待办事项相关
  events: async function (fetchInfo, successCallback, failureCallback) {
    await refreshtodoItems()
    successCallback(events.value)
  },

  // 点击和拖拽操作
  editable: true,
  eventClick,
  eventDrop,

  // 外部拖拽
  droppable: true,
  drop: async function (info: DropArg) {
    const entityId = info.draggedEl.dataset.entityId
    if (!entityId) {
      console.error('draggable: entityId not found')
      return null
    }
    const eId = new RecordId(entityTable.tb, entityId)

    await changeTodoItemAttribute(eId, attributeSchduledStart.value.id, info.date)
    await Promise.all([refreshtodoItems(), refreshUnScheduleTodoItems()])
  },
  // 跨日期选中
  selectable: true,
  select,

  // 自定义按钮
  customButtons,
  headerToolbar: {
    end: isMobileScreen.value ? 'today prev,next' : 'scheduleTask today prev,next'
  }
}))


async function onDetailPanelClose() {
  // 如果创建好以后没有编辑标题，则自动删除该事项
  if (createMode.value) {
    createMode.value = false
    if (selectedTodoItem.value && !selectedTodoItem.value.title) {
      await deleteTodoItem(selectedTodoItem.value.entity_id)
    }
  }
  await refreshtodoItems()
}

function onItemDragStart(e: DragEvent) {
  const target = e.currentTarget
  if (!(target instanceof HTMLLIElement) || !e.dataTransfer) {
    return
  }

  const itemId = target.dataset.entityId
  if (!itemId) {
    console.warn('onstart: no item id')
    return
  }
  e.dataTransfer.dropEffect = 'move'

  e.dataTransfer.setData(itemId, itemId)

  target.classList.add('drop-shadow')
}

function onItemDragEnd(e: DragEvent) {
  const target = e.currentTarget
  if (!(target instanceof HTMLLIElement)) {
    return
  }

  target.classList.remove('drop-shadow')
}
</script>
<template>
  <section class="w-full h-full flex">
    <FullCalendar ref="full-calendar" :options="calendarOptions" class="flex-1">
    </FullCalendar>

    <section class="p-2 flex flex-col w-auto min-w-80 transition-[width] duration-1000" v-if="scheduleTodoItemPanel">
      <header class="flex flex-row justify-end mb-2">
        <XCircleIcon class="w-6 h-6 cursor-pointer hover:fill-green-900" @click="scheduleTodoItemPanel = false" />
      </header>
      <ul ref="draggable-element" class="flex-1 overflow-y-auto flex flex-col">
        <TodoItemRow @click="todoItemDetailPopover?.show($event)" v-for="todoItem in unScheduleTodoItems"
          :key="todoItem.entity_id.toString()" show-checkbox :todoItem="todoItem" :draggable="true" show-tags
          @dragstart="onItemDragStart" @dragend="onItemDragEnd">
        </TodoItemRow>
      </ul>
    </section>
  </section>

  <!-- 详情 -->
  <Drawer v-if="isMobileScreen" class="todo-item-detail-drawer !h-[90%]" v-model:visible="itemDetailVisible"
    position="bottom" @close="onDetailPanelClose">
    <TodoItemDetail v-if="selectedTodoItem" v-model="selectedTodoItem" :key="selectedTodoItem?.entity_id.toString()" />
  </Drawer>
  <Popover ref="todoItemDetailPopover" @hide="onDetailPanelClose">
    <TodoItemDetail v-if="selectedTodoItem" v-model="selectedTodoItem" :key="selectedTodoItem?.entity_id.toString()"
      class="min-w-[400px] min-h-[300px] bg-white shadow-xl border" @update="refreshtodoItems"
      @delete="refreshtodoItems" />
  </Popover>
</template>
