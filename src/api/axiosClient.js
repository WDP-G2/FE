import axios from 'axios'
import { ENV } from '@/config/env'
import { setupInterceptors } from '@/api/interceptors'

const axiosClient = axios.create({
  baseURL: ENV.API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

setupInterceptors(axiosClient)

export default axiosClient
