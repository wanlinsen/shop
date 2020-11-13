import axios from 'axios'

export function request(config) {
  const instance = new axios.create({
    baseURL: 'http://timemeetyou.com:8889/api/private/v1/',
    timeout: 5000
  })
  //请求拦截
  axios.interceptors.request.use(config => {
    return config
  })
  //返回时拦截
  axios.interceptors.response.use(res => {
    return res.data
  })

  return instance(config)
}
