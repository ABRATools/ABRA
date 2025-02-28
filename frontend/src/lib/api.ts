import axios from 'axios';

// Create a single axios instance
const api = axios.create({
    baseURL: '/',
    headers: {
        'Content-Type': 'application/json'
    }
});

// Setup the interceptors that don't require hooks
api.interceptors.request.use(
    (config) => {
        const token = sessionStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => response.data,
    async (error) => {
        if (error.response?.status === 401) {
            // Instead of using hooks here, we'll just redirect
            sessionStorage.removeItem('token');
            window.location.href = '/login';
        }

        // Log the error but don't use toast here
        console.error('API Error:', error.response?.data?.message || 'An error occurred');
        return Promise.reject(error);
    }
);

export default api;