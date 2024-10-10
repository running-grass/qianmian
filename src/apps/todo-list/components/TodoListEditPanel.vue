<script lang="ts" setup>
import { identityTodoList, type TodoList } from '@/core';
import { ElMessage, type FormInstance } from 'element-plus';
import { reactive, ref } from 'vue';
import { createTodoList, refreshAllTodoList } from '../sql';

const emit = defineEmits(['close'])


const formRef = ref<FormInstance>()

const form = reactive<Partial<TodoList>>({
  identity: identityTodoList.value.id,
  title: '',
})

const submitForm = () => {
  const formEl = formRef.value
  if (!formEl) return
  formEl.validate(async (valid) => {
    if (!valid) {
      ElMessage.error("表单验证失败")
      return
    }

    await createTodoList(form.title!)
    refreshAllTodoList()
    ElMessage.success("创建成功")
    emit('close')
  })
}

</script>
<template>
  <section class="flex flex-col">
    <header class="text-xl mb-4">创建清单</header>
    <el-form ref="formRef" :model="form" label-width="auto" style="max-width: 600px">
      <el-form-item label="清单名称">
        <el-input v-model="form.title" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="submitForm">创建</el-button>
      </el-form-item>
    </el-form>
  </section>

</template>
