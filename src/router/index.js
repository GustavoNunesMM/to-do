import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '../views/LoginScreen.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/Task',
    name: 'Task',
    component: () => import('../views/itemManager.vue')
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
