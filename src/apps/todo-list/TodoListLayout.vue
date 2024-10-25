<script setup lang="ts">
import { ref } from 'vue'
import {
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  ListBulletIcon,
  QuestionMarkCircleIcon
} from '@heroicons/vue/24/solid'
import { initData, refreshAllTodoList } from './store'
import { CalendarDaysIcon, MagnifyingGlassIcon, } from '@heroicons/vue/16/solid';
import { useMobile } from '@/core';
import { useRoute, useRouter } from 'vue-router';

await initData()
await refreshAllTodoList()

const isCollapse = ref(true)
const handleOpen = (key: string, keyPath: string[]) => {
  console.log(key, keyPath)
}
const handleClose = (key: string, keyPath: string[]) => {
  console.log(key, keyPath)
}

const gotoDocs = () => {
  window.open('https://docs.qianmian.space/', '_blank')
}

const isMobile = useMobile()
const route = useRoute()
const router = useRouter()
const mobbileData = [
  {
    text: '清单',
    icon: ListBulletIcon,
    disabled: false,
    routeName: 'todo-list',
    menuIndex: '/todo-list/list',
    click: () => {
      router.push({ name: 'todo-list' })
    }
  },
  {
    text: '日历',
    icon: CalendarDaysIcon,
    disabled: false,
    routeName: 'todo-item-calendar',
    menuIndex: '/todo-list/calendar',
    click: () => {
      router.push({ name: 'todo-item-calendar' })
    }
  },
  {
    text: '搜索',
    icon: MagnifyingGlassIcon,
    disabled: false,
    routeName: 'todo-item-search',
    menuIndex: '/todo-list/search',
    click: () => {
      router.push({ name: 'todo-item-search' })
    },
  },
  {
    text: '帮助文档',
    icon: QuestionMarkCircleIcon,
    disabled: false,
    routeName: 'help',
    click: () => {
      gotoDocs()
    }
  }
]

</script>
<template>
  <div v-if="isMobile" class="w-full h-full flex flex-col overflow-hidden ">
    <section class="flex-1 w-full overflow-y-hidden">
      <RouterView />
    </section>
    <ul class="shrink-0 grow-0 h-12 w-full border-t flex justify-between px-4">
      <li class="flex-1 flex flex-col justify-center items-center"
        :class="{ 'text-gray-400': item.disabled, 'pointer-events-none': item.disabled, 'text-green-700': item.routeName === route.name }"
        data-track-category="todo-switch-view" :data-track-id="'todo-goto-' + item.routeName"
        v-for="item of mobbileData" :key="item.text" @click="item.click">
        <component :is="item.icon" class="min-w-6 min-h-6 size-6" />
        <span>{{ item.text }}</span>
      </li>
    </ul>
  </div>

  <div v-else class="w-full h-full overflow-hidden flex">
    <el-menu router :collapse="isCollapse" @open="handleOpen" @close="handleClose">
      <el-menu-item @click="isCollapse = !isCollapse">
        <ChevronDoubleRightIcon v-if="isCollapse" class="min-w-6 min-h-6 size-6 mr-2" />
        <ChevronDoubleLeftIcon v-else class="min-w-6 min-h-6 size-6 mr-2" />
        <template #title>{{ isCollapse ? '展开' : '收起' }}</template>
      </el-menu-item>
      <el-menu-item v-for="item of mobbileData" :key="item.routeName" :index="item.menuIndex" :disabled="item.disabled"
        data-track-category="todo-switch-view" :data-track-id="'todo-goto-' + item.routeName">
        <component :is="item.icon" class="min-w-6 min-h-6 size-6" />
        <template #title>{{ item.text }}</template>
      </el-menu-item>
    </el-menu>
    <main class="flex-1 h-full">
      <RouterView />
    </main>
  </div>
</template>
