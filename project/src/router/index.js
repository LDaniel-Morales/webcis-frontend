import { createRouter, createWebHistory } from 'vue-router'

import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: () => import('@/layouts/PublicLayout.vue'),
      children: [
        { path: '', component: () => import('@/views/public/HomeView.vue') },
        { path: 'login', component: () => import('@/views/public/LoginView.vue'), meta: { guest: true } },
        { path: 'register', component: () => import('@/views/public/RegisterView.vue'), meta: { guest: true } },
        { path: 'register/verify', component: () => import('@/views/public/RegisterView.vue'), meta: { guest: true } },
        { path: 'recover', component: () => import('@/views/public/RecoverView.vue'), meta: { guest: true } },
      ],
    },
    {
      path: '/app',
      component: () => import('@/layouts/AppLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        { path: '', component: () => import('@/views/app/DashboardView.vue') },
        { path: 'explorer', component: () => import('@/views/app/ExplorerView.vue') },
        { path: 'repository', component: () => import('@/views/app/RepositoryView.vue') },
        { path: 'profile', component: () => import('@/views/app/ProfileView.vue') },
      ],
    },
    {
      path: '/admin',
      component: () => import('@/layouts/AdminLayout.vue'),
      meta: { requiresAuth: true, requiresAdmin: true },
      children: [
        { path: '', component: () => import('@/views/admin/AdminDashboard.vue') },
      ],
    },
  ],
})

export async function authNavigationGuard(to) {
  const auth = useAuthStore()

  if (to.meta.requiresAuth) {
    if (!auth.sessionChecked) await auth.refreshSession()
    if (!auth.isAuthenticated) return { path: '/login' }
  }

  if (to.meta.guest && auth.isAuthenticated) return { path: '/app' }
  if (to.meta.requiresAdmin && auth.type !== 'Admin') return { path: '/app' }

  return true
}

router.beforeEach(authNavigationGuard)

export default router
