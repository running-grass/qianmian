import type { RouteRecordRaw } from 'vue-router'

export const knowledgeGraphRoutes: RouteRecordRaw = {
  path: '/entity/:id?',
  name: 'entity',
  component: () => import('./views/Entity/EntityPage.vue'),
  props: true
}
