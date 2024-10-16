<script setup lang="ts">
import { ref } from 'vue'
import {
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  ListBulletIcon,
  QuestionMarkCircleIcon
} from '@heroicons/vue/24/solid'
import { initData } from './store'
import { CalendarDaysIcon, MagnifyingGlassIcon, } from '@heroicons/vue/16/solid';

await initData()

const isCollapse = ref(true)
const handleOpen = (key: string, keyPath: string[]) => {
  console.log(key, keyPath)
}
const handleClose = (key: string, keyPath: string[]) => {
  console.log(key, keyPath)
}

const gotoDocs = () => {
  window.open('https://qianmian-docs.netlify.app', '_blank')
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

      <el-menu-item index="/todo-list/list">
        <ListBulletIcon class="min-w-6 min-h-6 size-6 mr-2" />
        <template #title>清单视图</template>
      </el-menu-item>
      <el-menu-item disabled>
        <CalendarDaysIcon class="min-w-6 min-h-6 size-6 mr-2" />
        <template #title>日历视图</template>
      </el-menu-item>
      <el-menu-item index="/todo-list/search/">
        <MagnifyingGlassIcon class="min-w-6 min-h-6 size-6 mr-2" />
        <template #title>搜索</template>
      </el-menu-item>
      <el-menu-item @click="gotoDocs">
        <QuestionMarkCircleIcon class="min-w-6 min-h-6 size-6 mr-2" />
        <template #title>文档</template>
      </el-menu-item>
    </el-menu>
    <main class="flex-1 h-full">
      <RouterView />
    </main>
  </div>
</template>
