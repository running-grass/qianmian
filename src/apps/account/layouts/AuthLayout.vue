<script setup lang="ts">
import { token } from '@/core'
import { useRouter } from 'vue-router'

const router = useRouter()
if (token.value) {
  router.push({ name: 'workbench' })
}
</script>
<template>
  <div class="flex w-screen h-screen overflow-hidden justify-center items-center flex-col">
    <RouterView class="flex-1" />
  </div>
</template>
