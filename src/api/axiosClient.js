import axios from 'axios'
import { API_BASE_URL } from '@/config/env'
import { setupInterceptors } from '@/api/interceptors'

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

setupInterceptors(axiosClient)

export default axiosClient
