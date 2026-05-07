import api from './api';

/**
 * Admin Authentication Service
 */

const login = async (phone, password) => {
    try {
        // The backend endpoint is defined as /api/admin/login
        // Since api.js base URL is .../api/, we use 'admin/login'
        const response = await api.post('admin/login', { phone, password });

        const { token, admin } = response.data;

        if (token) {
            localStorage.setItem('userToken', token);
            localStorage.setItem('adminData', JSON.stringify(admin));
        }

        return response.data;
    } catch (error) {
        console.error('Login service error:', error);
        throw error;
    }
};

const logout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('adminData');
    window.location.href = '/auth';
};

const getAdminData = () => {
    const data = localStorage.getItem('adminData');
    return data ? JSON.parse(data) : null;
};

const isAuthenticated = () => {
    return !!localStorage.getItem('userToken');
};

export default {
    login,
    logout,
    getAdminData,
    isAuthenticated
};
