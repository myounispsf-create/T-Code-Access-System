import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import InvoiceList from '../views/InvoiceList.vue'
import CreateInvoice from '../views/CreateInvoice.vue'
import InvoiceDetail from '../views/InvoiceDetail.vue'
import EditInvoice from '../views/EditInvoice.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: InvoiceList,
      meta: { requiresAuth: true }
    },
    {
      path: '/create',
      component: CreateInvoice,
      meta: { requiresAuth: true }
    },
    {
      path: '/invoice/:id',
      component: InvoiceDetail,
      meta: { requiresAuth: true }
    },
    {
      path: '/edit/:id',
      component: EditInvoice,
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