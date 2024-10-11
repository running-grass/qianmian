<script setup lang="tsx">
import { computed, reactive, ref, withKeys, withModifiers } from 'vue'
import { vOnClickOutside } from '@vueuse/components'

import {
  changeTodoItemDone,
  createTodoItem,
  showDones,
  orderField,
  type OrderField,
  allTodoList,
  todoItemsByList,
  refreshAllTodoList,
  selectedTodoList,
  selectedTodoItem,
  deleteTodoList
} from '../../store'
import { type RichEntity, type TodoItem, type TodoList } from '@/core'
import TodoItemDetail from '@/apps/todo-list/components/TodoItemDetail.vue'
import { useMediaQuery, useMouse } from '@vueuse/core'
import {
  CheckIcon,
  EllipsisHorizontalIcon,
  ArrowsUpDownIcon,
  Bars3Icon,
  PlusCircleIcon
} from '@heroicons/vue/24/solid'
import { useExportData, useImportData } from './importExport'
import dayjs from 'dayjs'
import { ElDialog } from 'element-plus'
import TodoListEditPanel from '../../components/TodoListEditPanel.vue'
import TodoListContextMenu from '../../components/TodoListContextMenu.vue'


await refreshAllTodoList()

// 非移动端，等同于tailwindcss 的md
const isPcScreen = useMediaQuery('(min-width: 768px)')
const isMobileScreen = computed(() => !isPcScreen.value)

const newTitle = ref<string>('')

// const editingTitle = ref<string>('')

/** 移动端抽屉 */
const mobileDrawer = ref(false)

async function changeCurrentObject(entity: TodoItem) {
  selectedTodoItem.value = {
    ...entity
  }
  mobileDrawer.value = true
}



async function createTodoItemUI() {
  const id = await createTodoItem(newTitle.value)

  const item = todoItemsByList.value.find((i) => i.entity_id.id === id.id)
  selectedTodoItem.value = item ?? null

  newTitle.value = ''
}

const todoListDrawer = ref(false)

/**
 * 删除当前选择的待办事项
 *
 * 如果当前未选择待办事项，则什么也不做
 */
async function deleteSelectedTodoItem() {
  if (!selectedTodoItem.value) {
    return
  }
  selectedTodoItem.value = null
}

async function changeOrderField(of: OrderField) {
  orderField.value = of
}

function TodoItemRow({ todoItem }: { todoItem: TodoItem }) {
  return (
    <li
      onClick={() => changeCurrentObject(todoItem)}
      class={[
        'py-2 px-4 hover:bg-green-50 flex items-center cursor-pointer',
        ...(selectedTodoItem.value?.entity_id.id === todoItem.entity_id.id ? ['bg-green-100'] : [])
      ]}
    >
      <el-checkbox
        checked={todoItem.done}
        size="large"
        onChange={(ev: boolean) => changeTodoItemDone(todoItem, ev)}
        onClick={withModifiers(() => { }, ['stop'])}
      />
      <div tabindex="-1" class="flex-1 ml-2 focus:outline-none">
        {todoItem.title}
      </div>
      <span class="text-sm text-gray-400">
        {todoItem.scheduled_start ? dayjs(todoItem.scheduled_start).fromNow() + '开始' : ''}
      </span>
    </li>
  )
}

const exportAllEntity = useExportData()
const startImportDialog = useImportData()
function openImportData() {
  startImportDialog()
}

function TodoItemCreateRow() {
  return (
    <>
      <div class="flex justify-start items-center mb-2">
        <Bars3Icon
          class="w-6 h-6 mr-4"
          onClick={() => (todoListDrawer.value = !todoListDrawer.value)}
        />
        <span class={''}>{selectedTodoList.value?.title}</span>
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
        <el-dropdown onCommand={changeOrderField}>
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
                  icon={orderField.value === 'schedule_start' ? CheckIcon : ''}
                  command="schedule_start"
                >
                  计划开始时间
                </el-dropdown-item>

                <el-dropdown-item
                  icon={orderField.value === 'schedule_end' ? CheckIcon : ''}
                  command="schedule_end"
                >
                  计划结束时间
                </el-dropdown-item>

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
                <el-dropdown-item onClick={() => (showDones.value = !showDones.value)}>
                  {showDones.value ? '隐藏已完成' : '显示已完成'}
                </el-dropdown-item>
                <el-dropdown-item onClick={exportAllEntity}>导出所有节点</el-dropdown-item>
                <el-dropdown-item onClick={openImportData}>导入数据</el-dropdown-item>
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
  closeTodoListContentMenu()

}

function deleteTodoListUI(todoList: TodoList) {
  closeTodoListContentMenu()

  if (confirm(`确定要删除清单${todoList.title}吗?`)) {
    deleteTodoList(todoList.entity_id)
  }
}

function selectTodoList(todoList: TodoList | null) {
  selectedTodoList.value = todoList
  todoItemsByList.value = []
  todoListDrawer.value = false
}

const todoListContextMenuTarget = ref<TodoList>()
const todoListContextMenuVisible = ref(false)
const todoListContentMenuPosition = reactive({ left: '0', top: '0', padding: 0 })
const { x, y } = useMouse()

const openTodoListContentMenu = (todoList: TodoList) => {
  console.log(x.value, y.value)
  todoListContentMenuPosition.left = x.value + 'px'
  todoListContentMenuPosition.top = y.value + 'px'

  todoListContextMenuTarget.value = todoList
  todoListContextMenuVisible.value = true
}

const closeTodoListContentMenu = () => {
  todoListContextMenuVisible.value = false
  todoListContextMenuTarget.value = undefined
}

function TodoListRow({ todoList }: { todoList: RichEntity }) {
  return (
    <li
      onClick={() => selectTodoList(todoList)}
      onDblclick={() => editTodoList(todoList)}
      onContextmenu={withModifiers(() => {
        openTodoListContentMenu(todoList)
      }, ['stop', 'prevent'])}
      class={[
        'py-2 px-4 hover:bg-green-50 flex items-center cursor-pointer',
        ...(selectedTodoList.value?.entity_id.id === todoList.entity_id.id ? ['bg-green-100'] : [])
      ]}
    >
      {todoList.title}
    </li>

  )
}

function TodoListSection() {
  return (
    <>
      <ul>
        <li
          class={[
            'py-2 px-4 hover:bg-green-50 flex items-center cursor-pointer',
            ...(selectedTodoList.value == null ? ['bg-green-100'] : [])
          ]}
          onClick={() => selectTodoList(null)}
        >
          全部待办事项
        </li>
      </ul>

      <p class="text-md my-2 text-gray-600 flex justify-between">
        <span>待办清单</span>
        <PlusCircleIcon title='新建清单' onClick={createTodoList} class="w-6 h-6" />
      </p>
      <ul>
        {allTodoList.value.map((todoList) => (
          <TodoListRow key={todoList.entity_id.id.toString()} todoList={todoList} />
        ))}
      </ul>
    </>
  )
}
</script>
<template>
  <div class="flex w-full h-full border-green-100">
    <section v-if="isPcScreen" class="w-80 border-r-2 p-2">
      <TodoListSection />
    </section>

    <aside class="min-w-80 flex-1 flex flex-col p-4 border-r-2">
      <TodoItemCreateRow></TodoItemCreateRow>
      <TransitionGroup name="list" tag="ul" class="flex-1 overflow-hidden">
        <TodoItemRow v-for="todoItem of todoItemsByList" :key="todoItem.entity_id.id.toString()" :todoItem="todoItem">
        </TodoItemRow>
      </TransitionGroup>
    </aside>

    <el-divider v-if="isPcScreen" direction="vertical" class="h-full hidden md:inline-block" />
    <article v-if="isPcScreen" class="flex-1 p-2 flex-col hidden md:flex todo-item-detail-host">
      <el-empty v-if="!selectedTodoItem" description="未选择事项" class="w-full h-full" />
      <TodoItemDetail v-else v-model="selectedTodoItem" :key="selectedTodoItem.entity_id.id.toString()"
        @delete="deleteSelectedTodoItem" />
    </article>
  </div>

  <el-drawer v-if="isMobileScreen" modal-class="todo-item-detail-drawer" v-model="mobileDrawer" size="60%"
    :with-header="false" destroy-on-close direction="btt">
    <TodoItemDetail v-if="selectedTodoItem" v-model="selectedTodoItem" :key="selectedTodoItem?.entity_id.toString()"
      @delete="deleteSelectedTodoItem" />
  </el-drawer>

  <el-drawer v-if="isMobileScreen" v-model="todoListDrawer" size="80%" :with-header="false" destroy-on-close
    direction="ltr">
    <TodoListSection />
  </el-drawer>

  <el-dialog v-model="createTodoListDialog" :with-header="false" destroy-on-close>
    <TodoListEditPanel @close="createTodoListDialog = false" v-model="createTodoListDialogModeValue"
      :mode="createTodoListDialogMode" />
  </el-dialog>

  <el-popover v-if="todoListContextMenuTarget" :visible="todoListContextMenuVisible" virtual-triggering
    placement="right" :popper-style="todoListContentMenuPosition" :show-arrow="false">
    <TodoListContextMenu v-on-click-outside="closeTodoListContentMenu" :todoList="todoListContextMenuTarget"
      @edit="editTodoList" @delete="deleteTodoListUI" />
  </el-popover>
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
