<script lang="ts" setup>
import { attributeThemeColor, updateEntity, type TodoList } from '@/core'
import { ElMessage, type FormInstance } from 'element-plus'
import { ref } from 'vue'
import { changeTodoItemAttribute, createTodoList, refreshAllTodoList } from '../store'

const emit = defineEmits(['close'])

const props = defineProps<{
  mode: 'create' | 'edit'
}>()

const modelValue = defineModel<TodoList>({ required: false })

const todoListModel = ref<Partial<TodoList>>(
  modelValue.value
    ? { ...modelValue.value }
    : {
        title: ''
      }
)

const formRef = ref<FormInstance>()

const submitForm = () => {
  const formEl = formRef.value
  if (!formEl) return
  formEl.validate(async (valid) => {
    if (!valid) {
      ElMessage.error('表单验证失败')
      return
    }
    let todoListId = null
    if (props.mode === 'edit') {
      todoListId = modelValue.value!.entity_id
      await updateEntity(todoListModel.value.entity_id!, {
        title: todoListModel.value.title
      })

      ElMessage.success('保存成功')
    } else {
      todoListId = await createTodoList(todoListModel.value.title!)
      ElMessage.success('创建成功')
    }

    if (modelValue.value?.theme_color !== todoListModel.value.theme_color) {
      await changeTodoItemAttribute(
        todoListId,
        attributeThemeColor.value.id,
        todoListModel.value.theme_color
      )
    }

    refreshAllTodoList()
    emit('close')
  })
}
</script>
<template>
  <section class="flex flex-col">
    <header class="text-xl mb-4">{{ props.mode === 'create' ? '创建清单' : '编辑清单' }}</header>
    <el-form ref="formRef" :model="todoListModel" label-width="auto" style="max-width: 600px">
      <el-form-item label="清单名称">
        <el-input v-model="todoListModel.title" @keydown.enter.prevent="submitForm" />
      </el-form-item>
      <el-form-item label="颜色">
        <el-color-picker v-model="todoListModel.theme_color" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="submitForm">{{
          props.mode === 'create' ? '创建' : '保存'
        }}</el-button>
      </el-form-item>
    </el-form>
  </section>
</template>
