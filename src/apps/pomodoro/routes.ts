import type { RouteRecordRaw } from 'vue-router'

export const pomodoroRoutes: RouteRecordRaw = {
  path: '/pomodoro',
  name: 'pomodoro-module',
  component: () => import('./PomodoroLayout.vue'),
  redirect: { name: 'pomodoro-home' },
  children: [
    // 入口页面
    {
      path: 'home',
      name: 'pomodoro-home',
      component: () => import('./views/PomodoroHomeView.vue'),
      props: true
    }
  ]
}
