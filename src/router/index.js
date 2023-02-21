import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/LoginScreen.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/user/:id',
    name: 'Task',
    component: () => import('../views/itemManager.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
