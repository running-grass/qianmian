<script setup lang="ts">
import { SURREAL_ACCESS, SURREAL_DATABASE, SURREAL_NAMESPACE, token } from '@/core'
import { getDb } from '@/core'
import { surrealdbAuthed$ } from '@/core/subjects/surrealdbSubject'
import { defaultHandleSurrealError } from '@/core/utils/error'
import { ElMessage } from 'element-plus'
import posthog from 'posthog-js'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const username = ref('')
const password = ref('')

const router = useRouter()

async function register() {
  if (!username.value || !password.value) {
    ElMessage({
      type: 'error',
      message: '用户名和密码不能为空'
    })
    return
  }

  const db = await getDb(false)
  const tokenStr = await db.signup({
    access: SURREAL_ACCESS,
    namespace: SURREAL_NAMESPACE,
    database: SURREAL_DATABASE,
    variables: {
      user: username.value,
      pass: password.value
    }
  }).catch(e => {
    defaultHandleSurrealError(e)
    throw e
  })

  token.value = tokenStr
  posthog.capture('register')
  surrealdbAuthed$.next(true)
  router.push({ name: 'workbench' })
}
</script>

<template>
  <div>
    <h1>注册账号</h1>
    <el-input type="text" v-model="username" placeholder="用户名" />
    <el-input type="password" v-model="password" placeholder="密码" />
    <div class="flex items-center">
      <el-button @click="register">注册</el-button>
      <el-button link @click="router.push({ name: 'login' })">返回登录</el-button>
    </div>
  </div>
</template>
