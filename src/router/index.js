import Vue from 'vue'
import VueRouter from 'vue-router'
import Add from '../components/goods/Add.vue'
import Cate from '../components/goods/Cate.vue'
import List from '../components/goods/List.vue'
import Params from '../components/goods/Params.vue'
import Login from '../components/Login.vue'
import Rights from '../components/power/Rights.vue'
import Roles from '../components/power/Roles.vue'
import Users from '../components/user/Users.vue'
import Welcome from '../components/Welcome.vue'
Vue.use(VueRouter)

// 实现懒加载
const Home = () => import('../components/Home.vue')

const routes = [
  {
    path: '/',
    redirect: '/login'
  },

  {
    path: '/login',
    component: Login
  },
  {
    path: '/home',
    component: Home,
    redirect: '/welcome',
    children: [
      {
        path: '/welcome',
        component: Welcome
      },
      {
        path: '/users',
        component: Users
      },
      {
        path: '/rights',
        component: Rights
      },
      {
        path: '/roles',
        component: Roles
      },
      {
        path: '/categories',
        component: Cate
      },
      {
        path: '/params',
        component: Params
      },
      {
        path: '/goods',
        component: List
      },
      {
        path: '/goods/add',
        component: Add
      }
    ]
  }
]

const router = new VueRouter({
  //使用history模式
  mode: 'history',
  routes
})

//利用导航守卫阻止用户的访问权限
//to 将要访问的路径 from 从哪里来的路径 next()：普通放行函数  next('/login):强制跳转
router.beforeEach((to, from, next) => {
  if (to.path == '/login') return next()

  //判断用户请求时是否携带了token
  const tokenStr = sessionStorage.getItem('token')
  if (!tokenStr) return next('/login')
  next()
})

export default router
