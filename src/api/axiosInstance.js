import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:3000/api/v1', // <-- Base URL Anda
  timeout: 5000,
});

// Interceptor: Tambahkan Authorization header ke setiap request
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      // Formatnya HARUS 'Bearer [Token JWT]'
      config.headers.Authorization = `Bearer ${token}`; 
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Anda bisa menambahkan interceptor response di sini untuk handle 401/403 global

export default instance;