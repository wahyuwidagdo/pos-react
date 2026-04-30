import axios from 'axios';
import { notifications } from '@mantine/notifications';

// Create axios instance with base URL pointing to the Go API
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor — attach JWT token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor — handle 401, 403, and network errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Network error (offline / server down)
        if (!error.response) {
            notifications.show({
                title: 'Network Error',
                message: 'Cannot reach the server. Please check your internet connection.',
                color: 'red',
                autoClose: 5000,
            });
            return Promise.reject(error);
        }

        const { status } = error.response;

        // 401 Unauthorized — token expired or invalid
        if (status === 401) {
            // Avoid redirect loop if already on login page
            if (!window.location.pathname.includes('/login')) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                notifications.show({
                    title: 'Session Expired',
                    message: 'Your session has expired. Please login again.',
                    color: 'orange',
                    autoClose: 4000,
                });
                // Small delay to let notification show
                setTimeout(() => {
                    window.location.href = '/login';
                }, 500);
            }
        }

        // 403 Forbidden
        if (status === 403) {
            notifications.show({
                title: 'Access Denied',
                message: error.response?.data?.error || 'You do not have permission to perform this action.',
                color: 'red',
                autoClose: 4000,
            });
        }

        // 400 Bad Request / 422 Unprocessable Entity — Validation errors from backend
        if (status === 400 || status === 422) {
            const data = error.response?.data;
            const message = data?.message || data?.error || 'The request contains invalid data.';
            notifications.show({
                title: 'Validation Error',
                message,
                color: 'red',
                autoClose: 5000,
            });
        }

        return Promise.reject(error);
    }
);

export default api;
