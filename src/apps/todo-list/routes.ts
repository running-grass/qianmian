import type { RouteRecordRaw } from 'vue-router'

export const todoListRoutes: RouteRecordRaw = {
  path: '/todo-list',
  name: 'todo-list-module',
  component: () => import('./TodoListLayout.vue'),
  children: [
    {
      path: '',
      name: 'todo-list',
      component: () => import('./views/TodoList/TodoListPage.vue')
    }
  ]
}
