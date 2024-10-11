<script setup lang="ts">
import { ref } from 'vue'
import {
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  ListBulletIcon
} from '@heroicons/vue/24/solid'
import { initData } from './store'

await initData()

const isCollapse = ref(true)
const handleOpen = (key: string, keyPath: string[]) => {
  console.log(key, keyPath)
}
const handleClose = (key: string, keyPath: string[]) => {
  console.log(key, keyPath)
}
</script>
<template>
  <div class="w-screen h-screen overflow-hidden flex">
    <el-menu class="el-menu-vertical-demo hidden md:block" router :collapse="isCollapse" @open="handleOpen"
      @close="handleClose">
      <el-menu-item @click="isCollapse = !isCollapse">
        <ChevronDoubleRightIcon v-if="isCollapse" class="min-w-6 min-h-6 size-6 mr-2" />
        <ChevronDoubleLeftIcon v-else class="min-w-6 min-h-6 size-6 mr-2" />
        <template #title>{{ isCollapse ? '展开' : '收起' }}</template>
      </el-menu-item>

      <el-menu-item index="/todo-list">
        <ListBulletIcon class="min-w-6 min-h-6 size-6 mr-2" />
        <template #title>清单视图</template>
      </el-menu-item>
    </el-menu>
    <main class="flex-1 h-full">
      <RouterView />
    </main>
  </div>
</template>
