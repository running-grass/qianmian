import type { RouteRecordRaw } from 'vue-router'

export const todoListRoutes: RouteRecordRaw = {
  path: '/todo-list',
  name: 'todo-list-module',
  component: () => import('./TodoListLayout.vue'),
  redirect: { name: 'todo-list' },
  children: [
    // 清单视图
    {
      path: 'list/:todoListId?',
      name: 'todo-list',
      component: () => import('./views/TodoList/TodoListPage.vue'),
      props: true
    },
    // 日历视图
    {
      path: 'calendar',
      name: 'todo-item-calendar',
      component: () => import('./views/Calendar/CalendarPage.vue')
    },
    // 搜索视图
    {
      path: 'search/:keyword?',
      name: 'todo-item-search',
      component: () => import('./views/Search/TodoItemSearchPage.vue'),
      props: true
    }
  ]
}
