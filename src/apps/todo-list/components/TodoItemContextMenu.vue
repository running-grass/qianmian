<script setup lang="ts">
import { StringRecordId, type TodoItem } from '@/core'
import { allTodoList, changeBelongListTo, changeTodoItemDone } from '../store'
import type { CascaderProps } from 'element-plus'

const props = defineProps<{ todoItem: TodoItem }>()

const emit = defineEmits(['executed'])

type ValType = 'delete' | 'abandoned' | string

type BtnType = {
  label: string
  disabled?: boolean
  value: ValType
  leaf?: boolean
  children?: BtnType[]
}

const currentTodoListId = props.todoItem.belong_to?.id?.toString()
const btns: BtnType[] = [
  {
    label: '删除',
    value: 'delete',
    leaf: true
  },
  {
    label: '放弃',
    disabled: props.todoItem.done,
    value: 'abandoned',
    leaf: true
  },
  {
    label: '移动至清单',
    value: 'move',
    leaf: false,
    children: allTodoList.value.map((todoList) => ({
      label: todoList.title,
      value: todoList.entity_id.toString(),
      leaf: true,
      disabled: currentTodoListId === todoList.entity_id.toJSON()
    }))
  }
]

async function onCommand(val: ValType[]) {
  switch (val[0]) {
    case 'delete':
      if (confirm(`确定要放弃吗?`)) {
        await changeTodoItemDone(props.todoItem.entity_id, true, 'abandoned')
      }
      break
    case 'abandoned':
      if (confirm(`确定要放弃吗?`)) {
        await changeTodoItemDone(props.todoItem.entity_id, true, 'abandoned')
      }
      break
    case 'move':
      await changeBelongListTo(props.todoItem.entity_id, new StringRecordId(val[1]))
      break
  }

  emit('executed', props.todoItem.entity_id)
}

const cascaderProps: CascaderProps = {
  expandTrigger: 'hover'
}
</script>
<template>
  <el-cascader-panel @change="onCommand" :options="btns" :props="cascaderProps" />
</template>
<style lang="css" scoped>
:deep(.el-cascader-node.is-active) {
  color: inherit;

  .el-cascader-node__prefix {
    display: none;
  }
}
</style>
