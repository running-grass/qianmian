<script setup lang="ts">
import { SURREAL_ACCESS, SURREAL_DATABASE, SURREAL_NAMESPACE, token } from '@/core'
import { getDb } from '@/core'
import { surrealdbAuthed$ } from '@/core/subjects/surrealdbSubject'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const username = ref('')
const password = ref('')

const router = useRouter()

async function login() {
  const db = await getDb(false)
  const tokenStr = await db.signin({
    access: SURREAL_ACCESS,
    namespace: SURREAL_NAMESPACE,
    database: SURREAL_DATABASE,

    username: username.value,
    password: password.value
  })

  token.value = tokenStr

  surrealdbAuthed$.next(true)
  router.push({ name: 'workbench' })
}
</script>

<template>
  <div>
    <h1>登录</h1>
    <el-input type="text" v-model="username" placeholder="用户名" />
    <el-input type="password" v-model="password" placeholder="密码" />
    <div class="flex items-center">
      <el-button @click="login">登录</el-button>
      <el-button link @click="router.push({ name: 'register' })">去注册</el-button>
    </div>
  </div>
</template>
