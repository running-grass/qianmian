<script lang="ts" setup>
import { initBuiltInData } from '@/core'
import { ensureAuthed } from '@/core/db'

// 检测登录状态
await ensureAuthed()
await initBuiltInData()
</script>
<template>
  <RouterView />
</template>
