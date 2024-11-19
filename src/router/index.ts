import { accountRoutes } from '@/apps/account/routes'
import { knowledgeGraphRoutes } from '@/apps/entity/routes'
import { todoListRoutes } from '@/apps/todo-list/routes'
import { pomodoroRoutes } from '@/apps/pomodoro/routes'
import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '@/apps/other/views/HomePage.vue'
import { SURREAL_TOKEN_KEY } from '@/core'
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'entrypoint',
      redirect() {
        if (localStorage.getItem(SURREAL_TOKEN_KEY)) {
          return { name: 'workbench' }
        } else {
          return { name: 'home' }
        }
      }
    },
    {
      path: '/home',
      name: 'home',
      component: HomePage
    },
    accountRoutes,
    {
      path: '/workbench',
      component: () => import('@/component/WorkbenchLayout.vue'),
      name: 'workbench',
      redirect: { name: 'todo-list' },
      children: [todoListRoutes, knowledgeGraphRoutes, pomodoroRoutes]
    }
  ]
})

export default router
