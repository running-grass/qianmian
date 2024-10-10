import type { RouteRecordRaw } from 'vue-router'

export const accountRoutes: RouteRecordRaw = {
  path: '/account/auth',
  component: () => import('./layouts/AuthLayout.vue'),
  children: [
    {
      path: 'login',
      name: 'login',
      component: () => import('./views/Auth/LoginPage.vue')
    },
    {
      path: 'register',
      name: 'register',
      component: () => import('./views/Auth/RegisterPage.vue')
    }
  ]
}
