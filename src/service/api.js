import axios from 'axios';
import { navigate } from './navigationService';

export const BASE_URL = 'https://leaditoai.com/api/';
// export const BASE_URL = 'http://localhost:8000/api/';

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    (config) => {
        // Don't add token for public routes to avoid 'malformed token' errors
        const publicRoutes = ['admin/login'];
        const isPublicRoute = config.url ? publicRoutes.some(route => config.url.includes(route)) : false;

        if (!isPublicRoute) {
            // Web uses localStorage instead of AsyncStorage
            const token = localStorage.getItem('userToken');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response) {
            if (error.response.status === 401) {
                // Unauthorized: token might be missing or expired
                console.log('Session expired or unauthorized. Redirecting to login.');
                localStorage.removeItem('userToken');
                localStorage.removeItem('adminData');

                // Clear the state and redirect to login
                window.location.href = '/auth';
            } else if (error.response.status === 403) {
                // Forbidden: Subscription missing or restricted access
                console.log('Access denied: Subscription missing or restricted.');

                // For mobile compatibility we had navigate('Main', { screen: 'Plans' })
                // In admin portal, we redirect to plans page
                window.location.href = '/admin/plans';
            }
        }
        return Promise.reject(error);
    }
);


export default api;

