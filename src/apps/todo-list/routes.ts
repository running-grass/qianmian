import type { RouteRecordRaw } from 'vue-router'

export const todoListRoutes: RouteRecordRaw = {
  path: '/todo-list',
  name: 'todo-list-module',
  component: () => import('./TodoListLayout.vue'),
  children: [
    {
      path: ':todoListId?',
      name: 'todo-list',
      component: () => import('./views/TodoList/TodoListPage.vue'),
      props: true
    }
  ]
}
