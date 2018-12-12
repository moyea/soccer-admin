import axios from 'axios';

const baseURL = '/api';
// const baseURL = 'http://localhost:8000';
const API = axios.create({
  baseURL
});

API.interceptors.response.use(res => {
  if (!res) {
    return Promise.reject({msg: '系统错误，请稍后重试'});
  }
  if (res.status >= 200 && res.status < 300) {
    return Promise.resolve(res.data);
  }
  switch (res.status) {
    case 400:
      res.msg = '请求错误';
      break;
    case 401:
      res.msg = '未授权，请登录';
      break;
    case 403:
      res.msg = '拒绝访问';
      break;
    case 404:
      res.msg = `请求地址出错`;
      break;
    case 408:
      res.msg = '请求超时';
      break;
    case 500:
      res.msg = '服务器内部错误';
      break;
    case 501:
      res.msg = '服务未实现';
      break;
    case 502:
      res.msg = '网关错误';
      break;
    case 503:
      res.msg = '服务不可用';
      break;
    case 504:
      res.msg = '网关超时';
      break;
    case 505:
      res.msg = 'HTTP版本不受支持';
      break;
    default:
      res.msg = '未知错误,请稍后重试';
  }
  return Promise.reject(res);
});

export default API;
