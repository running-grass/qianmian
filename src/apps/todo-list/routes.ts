import type { RouteRecordRaw } from 'vue-router'

export const todoListRoutes: RouteRecordRaw = {
  path: '/todo-list',
  name: 'todo-list-module',
  component: () => import('./TodoListLayout.vue'),
  redirect: { name: 'todo-list' },
  children: [
    {
      path: 'list/:todoListId?',
      name: 'todo-list',
      component: () => import('./views/TodoList/TodoListPage.vue'),
      props: true
    },
    {
      path: 'search/:keyword?',
      name: 'todo-item-search',
      component: () => import('./views/Search/TodoItemSearchPage.vue'),
      props: true
    }
  ]
}
