import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import TCodeRequestList from '../views/TCodeRequestList.vue'
import CreateTCodeRequest from '../views/CreateTCodeRequest.vue'
import TCodeRequestDetail from '../views/TCodeRequestDetail.vue'
import EditTCodeRequest from '../views/EditTCodeRequest.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: TCodeRequestList,
      meta: { requiresAuth: true }
    },
    {
      path: '/create',
      component: CreateTCodeRequest,
      meta: { requiresAuth: true }
    },
    {
      path: '/tcode-request/:id',
      component: TCodeRequestDetail,
      meta: { requiresAuth: true }
    },
    {
      path: '/edit/:id',
      component: EditTCodeRequest,
      meta: { requiresAuth: true }
    },
    {
      path: '/login',
      component: Login
    },
    {
      path: '/register',
      component: Register
    }
  ]
})

// Route Guard
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  if (to.meta.requiresAuth && !token) {
    next('/login')
  } else if (token && to.path === '/login') {
    next('/')
  } else {
    next()
  }
})

export default router