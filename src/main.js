import axios from 'axios'
import Vue from 'vue'
import App from './App.vue'
import './assets/css/global.css'
import './plugins/element.js'
import router from './router'
import store from './store'
Vue.config.productionTip = false

//全局配置axios，使得所有vue的组件都能通过$http调用axios
Vue.prototype.$http = axios
//设置axios默认根路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'

axios.interceptors.request.use(config => {
  config.headers.Authorization = sessionStorage.getItem('token')
  return config
})

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
