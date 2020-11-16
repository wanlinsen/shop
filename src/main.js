import axios from 'axios'
// 导入富文本编辑器的样式
import 'quill/dist/quill.bubble.css' // for bubble theme
import 'quill/dist/quill.core.css' // import styles
import 'quill/dist/quill.snow.css' // for snow theme
import Vue from 'vue'
// 导入富文本编辑器
import VueQuillEditor from 'vue-quill-editor'
import TreeTable from 'vue-table-with-tree-grid'
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

//全局添加 vue-table-with-tree-grid组件
Vue.component('tree-table', TreeTable)

// 配置全局过滤器，用于处理时间
Vue.filter('dateFormat', function(originVal) {
  const dt = new Date(originVal)

  const y = dt.getFullYear()
  //ES6语法，对字符串进行操作，表示该字符串不足几位，自动补0
  const m = (dt.getMonth() + 1 + '').padStart(2, '0')
  const d = (dt.getDate() + '').padStart(2, '0')

  const hh = (dt.getHours() + '').padStart(2, '0')
  const mm = (dt.getMinutes() + '').padStart(2, '0')
  const ss = (dt.getSeconds() + '').padStart(2, '0')

  // return y + '-' + m + '-' + d + ' ' + hh + ':' + mm + ':' + ss
  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})

// 全局配置富文本编辑器
Vue.use(VueQuillEditor /* { default global options } */)
new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
