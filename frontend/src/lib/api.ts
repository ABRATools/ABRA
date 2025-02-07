import axios from 'axios';
import { useToast } from '@/hooks/use-toast';

const api = axios.create({
    baseURL: '/',
    headers: {
        'Content-Type': 'application/json'
    }
})

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
    (error) => {
        const toast = useToast();

        if (error.response?.status === 401) {
            window.location.href = '/login';
        }

        toast({ // make a nice toast for them when something is wrong
            title: 'Error',
            description: error.response?.data?.message || 'An error occurred',
            variant: 'destructive',
        });

        return Promise.reject(error);
    }
);

export default api;