<script setup lang="tsx">
import { computed, ref, useTemplateRef, withKeys, withModifiers } from 'vue'

import {
  type OrderField,
  allTodoList,
  changeBelongListTo,
  changeTodoItemAttribute,
  changeTodoItemDone,
  deleteTodoItem,
  deleteTodoList,
  todoListInitialized,
  todoListLoading
} from '../../store'
import {
  attributeSchduledStart,
  attributeTag,
  createEntity,
  entityRelationsTable,
  entityTable,
  getDb,
  identityTodoItem,
  relationBelongToTodoList,
  StringRecordId,
  useMobile,
  type EntityId,
  type TodoItem,
  type TodoList
} from '@/core'
import TodoItemDetail from '@/apps/todo-list/components/TodoItemDetail.vue'
import {
  CheckIcon,
  EllipsisHorizontalIcon,
  ArrowsUpDownIcon,
  Bars3Icon,
  PlusCircleIcon
} from '@heroicons/vue/24/solid'
import { useExportData, useImportData } from './importExport'
import TodoListEditPanel from '../../components/TodoListEditPanel.vue'
import { useRouter } from 'vue-router'
import TodoItemRow from '../../components/TodoItemRow.vue'
import {
  selectedTodoList,
  refreshtodoItems,
  todoItemsByList,
  orderField,
  showDones,
  selectedTodoItem,
  todoItemsByListLoading
} from './store'
import { myDayjs } from '@/plugins/dayjs'
import { RecordId } from 'surrealdb'
import Drawer from 'primevue/drawer';
import Dialog from 'primevue/dialog'
import ContextMenu from 'primevue/contextmenu'
import type { MenuItem, MenuItemCommandEvent } from 'primevue/menuitem'
import ProgressSpinner from 'primevue/progressspinner';

const props = defineProps<{
  todoListId: string | undefined
}>()

// 如果有待办事项,则选中
if (props.todoListId) {
  if (
    props.todoListId === 'all' ||
    props.todoListId === 'today' ||
    props.todoListId === 'tomorrow' ||
    props.todoListId === 'today_done'
  ) {
    {
      selectedTodoList.value = props.todoListId
    }
  } else {
    const item = allTodoList.value.find((i) => i.entity_id.toString() === props.todoListId)
    if (item) {
      selectedTodoList.value = item
    }
  }
}

refreshtodoItems()
const isMobileScreen = useMobile()

const newTitle = ref<string>('')

/** 移动端抽屉 */
const mobileDrawerVisible = ref(false)

/** 切换当前选中的待办事项 */
async function changeCurrentObject(entity: TodoItem) {
  selectedTodoItem.value = entity
  mobileDrawerVisible.value = true
}

/**
 * 创建一个新的待办事项
 *
 * @param title 待办事项的标题
 * @returns 新创建的待办事项的 RecordId
 */
async function createTodoItemUI() {
  const id = await createEntity(identityTodoItem.value.id, newTitle.value)
  const todoList = typeof selectedTodoList.value === 'string' ? undefined : selectedTodoList.value

  const db = await getDb()
  if (todoList) {
    await db.relate(id, entityRelationsTable.tb, todoList.entity_id, {
      relation: relationBelongToTodoList.value.id
    })
  }

  if (selectedTodoList.value === 'today') {
    await changeTodoItemAttribute(
      id,
      attributeSchduledStart.value.id,
      myDayjs().startOf('day').toDate()
    )
  } else if (selectedTodoList.value === 'tomorrow') {
    await changeTodoItemAttribute(
      id,
      attributeSchduledStart.value.id,
      myDayjs().add(1, 'day').startOf('day').toDate()
    )
  } else if (typeof selectedTodoList.value === 'object') {
    const listTag = selectedTodoList.value.tags

    if (listTag.length > 0) {
      await changeTodoItemAttribute(id, attributeTag.value.id, listTag)
    }
  }

  await refreshtodoItems()

  const item = todoItemsByList.value.find((i) => i.entity_id.id === id.id)
  selectedTodoItem.value = item ?? null

  newTitle.value = ''
}

async function changeOrderField(of: OrderField) {
  orderField.value = of
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

const exportAllEntity = useExportData()
const startImportDialog = useImportData()
function openImportData() {
  startImportDialog()
}

const todoListDrawer = ref(false)

function getTodoListTitle(todoList: typeof selectedTodoList.value) {
  let title = ''
  switch (todoList) {
    case 'all':
      title = '所有事项'
      break
    case 'today':
      title = '今天'
      break
    case 'tomorrow':
      title = '明天'
      break
    // case '3_day': title = '最近3天'; break
    case 'today_done':
      title = '今天已完成'
      break
    case 'unorganized':
      title = '未归类'
      break
    case 'unscheduled':
      title = '未排期'
      break
    case 'abandoned':
      title = '已放弃'
      break
    default:
      title = todoList.title
  }

  return title
}

const disabledOrderList: typeof selectedTodoList.value[] = ['today', 'tomorrow', 'today_done', 'abandoned']
function TodoItemCreateRow() {
  return (
    <>
      <div class="flex justify-start items-center mb-2">
        <Bars3Icon
          class="w-6 h-6 mr-4"
          onClick={() => (todoListDrawer.value = !todoListDrawer.value)}
        />
        <span class={''}>{getTodoListTitle(selectedTodoList.value)}</span>
      </div>
      <div class="mb-4 flex items-center">
        <el-input
          tabindex="1"
          class="flex-1"
          type="text"
          modelValue={newTitle.value}
          onInput={(value: string) => (newTitle.value = value)}
          onKeydown={withKeys(createTodoItemUI, ['enter'])}
          placeholder="添加一个事项"
        />
        <el-dropdown onCommand={changeOrderField} disabled={disabledOrderList.includes(selectedTodoList.value)}>
          {{
            default: () => <ArrowsUpDownIcon class="w-6 h-6 mx-2" />,
            dropdown: () => (
              <el-dropdown-menu>
                <el-dropdown-item
                  icon={orderField.value === 'priority' ? CheckIcon : ''}
                  command="priority"
                >
                  优先级
                </el-dropdown-item>
                <el-dropdown-item
                  icon={orderField.value === 'created_at' ? CheckIcon : ''}
                  command="created_at"
                >
                  创建时间
                </el-dropdown-item>
                <el-dropdown-item
                  icon={orderField.value === 'updated_at' ? CheckIcon : ''}
                  command="updated_at"
                >
                  更新时间
                </el-dropdown-item>
                <el-dropdown-item
                  icon={orderField.value === 'scheduled_start' ? CheckIcon : ''}
                  command="scheduled_start"
                >
                  计划开始时间
                </el-dropdown-item>

                {/* <el-dropdown-item
                  icon={orderField.value === 'scheduled_end' ? CheckIcon : ''}
                  command="scheduled_end"
                >
                  计划结束时间
                </el-dropdown-item> */}

                <el-dropdown-item
                  icon={orderField.value === 'deadline' ? CheckIcon : ''}
                  command="deadline"
                >
                  截止时间
                </el-dropdown-item>
              </el-dropdown-menu>
            )
          }}
        </el-dropdown>

        <el-dropdown>
          {{
            default: () => <EllipsisHorizontalIcon class="w-6 h-6" />,
            dropdown: () => (
              <el-dropdown-menu>
                <el-dropdown-item
                  disabled={typeof selectedTodoList.value === 'string'}
                  onClick={() => (showDones.value = !showDones.value)}
                >
                  {showDones.value ? '隐藏已完成' : '显示已完成'}
                </el-dropdown-item>
                <el-dropdown-item onClick={exportAllEntity}>导出数据(json)</el-dropdown-item>
                <el-dropdown-item onClick={openImportData} disabled>
                  导入数据(json)
                </el-dropdown-item>
              </el-dropdown-menu>
            )
          }}
        </el-dropdown>
      </div>
    </>
  )
}

// 清单编辑弹窗

/** 清单编辑弹窗 */
const createTodoListDialog = ref(false)
/** 清单弹窗的模式 创建或者编辑 */
const createTodoListDialogMode = ref<'create' | 'edit'>('create')
const createTodoListDialogModeValue = ref<TodoList>()

function createTodoList() {
  createTodoListDialogModeValue.value = undefined
  createTodoListDialogMode.value = 'create'
  createTodoListDialog.value = true
}

function editTodoList(todoList: TodoList) {
  createTodoListDialogModeValue.value = todoList
  createTodoListDialogMode.value = 'edit'
  createTodoListDialog.value = true
}

function deleteTodoListUI(todoList: TodoList) {
  if (confirm(`确定要删除清单${todoList.title}吗?`)) {
    deleteTodoList(todoList.entity_id)
  }
}

const router = useRouter()
function selectTodoList(todoList: typeof selectedTodoList.value) {
  if (selectedTodoList.value === todoList) return
  selectedTodoList.value = todoList
  todoItemsByList.value = []
  todoListDrawer.value = false

  const todoListId = typeof todoList === 'string' ? todoList : todoList?.entity_id?.toString()
  router.push({ name: 'todo-list', params: { todoListId } })
}

// 清单右键菜单
const todoListContextMenuTarget = ref<TodoList>()

const todoListContextMenuRef = useTemplateRef('todoListContextMenu')
const todoListContextCommands: MenuItem[] = [
  {
    label: '编辑',
    command: () => {
      if (typeof todoListContextMenuTarget.value === 'object') {
        editTodoList(todoListContextMenuTarget.value)
      }
    }
  },
  {
    label: '删除',
    command: () => {
      if (typeof todoListContextMenuTarget.value === 'object') {
        deleteTodoListUI(todoListContextMenuTarget.value)
      }
    }
  }

]

const openTodoListContentMenu = async (event: Event, todoList: TodoList) => {
  todoListContextMenuRef.value?.show(event)
  todoListContextMenuTarget.value = todoList
}


const onListDropEnter = (ev: DragEvent) => {
  const target = ev.currentTarget
  if (!(target instanceof HTMLLIElement) || !ev.dataTransfer) {
    console.warn('no target', target, ev.currentTarget)
    return
  }
  target.classList.remove('bg-green-300', 'cursor-alias', 'cursor-no-drop')

  const listId = target.dataset.id

  const itemId = ev.dataTransfer.types[0]
  if (!itemId) {
    console.warn('no item id')
    return
  }

  const item = todoItemsByList.value.find((i) => i.entity_id.id.toString() === itemId)

  if (!item) {
    console.warn('no item')
    return
  }

  if (item.belong_to?.id?.toString() === listId) {
    console.log('already in list')
    return
  }

  target.classList.add('bg-green-300')
  ev.dataTransfer.dropEffect = 'move'
  ev.preventDefault()
}

const clearDragClass = (ev: DragEvent) => {
  const target = ev.currentTarget
  if (!(target instanceof HTMLLIElement)) {
    return
  }
  target.classList.remove('bg-green-300', 'cursor-alias', 'cursor-no-drop')
  ev.preventDefault()
}

async function onItemDrop(e: DragEvent) {
  const target = e.currentTarget

  clearDragClass(e)

  if (!(target instanceof HTMLLIElement) || !e.dataTransfer) {
    return
  }

  const listId = target.dataset.id

  const itemId = e.dataTransfer.types[0]

  if (!itemId || !listId) {
    console.warn('no item id')
    return
  }

  const tlid = new StringRecordId(listId)
  const tiid = new RecordId(entityTable.tb, itemId)

  await changeBelongListTo(tiid, tlid)
  await refreshtodoItems()
}

function TodoListRow({ todoList }: { todoList: TodoList }) {
  return (
    <li
      onClick={() => selectTodoList(todoList)}
      onDragover={onListDropEnter}
      onDragleave={clearDragClass}
      onDrop={onItemDrop}
      data-track-category="todo-switch-todo-list"
      onContextmenu={withModifiers((event) => {
        openTodoListContentMenu(event, todoList)
      }, ['stop', 'prevent'])}
      class={[
        'py-2 pl-2 pr-2 hover:bg-green-50 flex items-center cursor-pointer',
        ...(typeof selectedTodoList.value === 'object' &&
          selectedTodoList.value?.entity_id.id === todoList.entity_id.id
          ? ['bg-green-100']
          : [])
      ]}
      data-id={todoList.entity_id.toString()}
    >
      <div class="flex-1"> {todoList.title}</div>
      {todoList.theme_color && (
        <span class="w-0.5 h-full mr-2" style={{ backgroundColor: todoList.theme_color }}>
          &nbsp;
        </span>
      )}
    </li>
  )
}

type VList = typeof selectedTodoList.value
const vLists: VList[] = [
  'all',
  'today',
  'tomorrow',
  'today_done',
  'unorganized',
  'unscheduled',
  'abandoned'
]

function TodoListSection() {
  return (
    <>
      <ul>
        {vLists.map((vList) => (
          <li
            class={[
              'py-2 px-4 hover:bg-green-50 flex items-center cursor-pointer',
              ...(selectedTodoList.value == vList ? ['bg-green-100'] : [])
            ]}
            onClick={() => selectTodoList(vList)}
            key={vList.toString()}
            data-track-category="todo-switch-virtual-list"
            data-track-id={'todo-switch-virtual-list-' + vList}
          >
            {getTodoListTitle(vList)}
          </li>
        ))}
      </ul>

      <p class="text-md my-2 text-gray-600 flex justify-between">
        <span>待办清单</span>
        <PlusCircleIcon title="新建清单" onClick={createTodoList} class="w-6 h-6" />
      </p>
      <ul class="flex flex-col">
        {todoListLoading.value ? <ProgressSpinner class="self-center" fill="transparent" /> : null}
        {allTodoList.value.map((todoList) => (
          <TodoListRow key={todoList.entity_id.id.toString()} todoList={todoList} />
        ))}

      </ul>
    </>
  )
}

// 待办事项选中
const todoItemContextMenuRef = useTemplateRef('todoItemContextMenu')
const todoItemContextMenuTarget = ref<TodoItem>()

const todoItemContextCommands = computed<MenuItem[]>(() => {
  const currentItem = todoItemContextMenuTarget.value;
  if (!currentItem) {
    return []
  }

  const currentTodoListId = currentItem.belong_to?.id?.toString()

  const changeBelongListToLocal = async (event: MenuItemCommandEvent) => {
    const item = event.item
    if (!item.todoListId) {
      throw new Error('no todo list id')
    }
    const todoListId = item.todoListId as EntityId
    await changeBelongListTo(currentItem.entity_id, todoListId)
    await refreshtodoItems()

  }

  return [
    {
      label: '删除',
      leaf: true,
      command: async () => {
        await deleteTodoItem(currentItem.entity_id)
        await refreshtodoItems()
      }
    },
    {
      label: '放弃',
      disabled: currentItem.done,
      command: async () => {
        await changeTodoItemDone(currentItem, true, 'abandoned')
        await refreshtodoItems()

      }
    },
    {
      separator: true
    },
    {
      label: '移动至清单',
      items: allTodoList.value.map((todoList) => ({
        label: todoList.title,
        disabled: currentTodoListId === todoList.entity_id.toJSON(),
        todoListId: todoList.entity_id,
        command: changeBelongListToLocal,
      })),
    }
  ]
})
async function openTodoItemContextMenu(event: Event, item: TodoItem) {
  todoItemContextMenuTarget.value = item
  todoItemContextMenuRef.value?.show(event)
}

const showItemTags = ref(!isMobileScreen.value)
</script>
<template>
  <div class="flex w-full h-full border-green-100">
    <ProgressSpinner v-if="!todoListInitialized" class="self-center" fill="transparent" />
    <template v-else>
      <aside v-if="!isMobileScreen" class="w-40 grow-[1] shrink-0 border-r-2 p-2">
        <TodoListSection />
      </aside>


      <section class="w-80 grow-[2] shrink-0 flex flex-col p-4 border-r-2">

        <ProgressSpinner v-if="todoItemsByListLoading" class="self-center" fill="transparent" />
        <template v-else>
          <TodoItemCreateRow></TodoItemCreateRow>
          <TransitionGroup name="list" tag="ul" class="flex-1 overflow-x-hidden overflow-y-auto">
            <TodoItemRow v-for="todoItem of todoItemsByList" :key="todoItem.entity_id.id.toString()"
              :todoItem="todoItem" :show-list="selectedTodoList === null" @click="changeCurrentObject(todoItem)"
              :draggable="true" :showTags="showItemTags"
              @contextmenu.stop.prevent="openTodoItemContextMenu($event, todoItem)" @dragstart="onItemDragStart"
              @dragend="onItemDragEnd" @update="refreshtodoItems" :class="[
                ...(selectedTodoItem?.entity_id.id === todoItem.entity_id.id ? ['bg-green-100'] : [])
              ]">
            </TodoItemRow>
          </TransitionGroup>
        </template>

      </section>

      <article v-if="!isMobileScreen" class="grow-[3] p-2 flex-col hidden md:flex todo-item-detail-host">
        <el-empty v-if="!selectedTodoItem" description="未选择事项" class="w-full h-full" />
        <TodoItemDetail v-else v-model="selectedTodoItem" :key="selectedTodoItem.entity_id.id.toString()"
          @update="refreshtodoItems" @delete="refreshtodoItems" />
      </article>
    </template>
  </div>

  <Drawer v-if="isMobileScreen" class="todo-item-detail-drawer !h-[90%]" v-model:visible="mobileDrawerVisible"
    position="bottom">
    <TodoItemDetail v-if="selectedTodoItem" v-model="selectedTodoItem" :key="selectedTodoItem?.entity_id.toString()"
      @update="refreshtodoItems" @delete="refreshtodoItems" />
  </Drawer>

  <Drawer v-if="isMobileScreen" class="!h-[80%]" v-model:visible="todoListDrawer" position="bottom">
    <TodoListSection />
  </Drawer>

  <Dialog v-model:visible="createTodoListDialog">
    <TodoListEditPanel @close="createTodoListDialog = false" v-model="createTodoListDialogModeValue"
      :mode="createTodoListDialogMode" />
  </Dialog>
  <ContextMenu ref="todoListContextMenu" :model="todoListContextCommands">
  </ContextMenu>

  <ContextMenu ref="todoItemContextMenu" :model="todoItemContextCommands" @hide="refreshtodoItems">
  </ContextMenu>
</template>

<style lang="css" scoped>
.list-move,
/* 对移动中的元素应用的过渡 */
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

/* 确保将离开的元素从布局流中删除
  以便能够正确地计算移动的动画。 */
.list-leave-active {
  position: absolute;
}
</style>
