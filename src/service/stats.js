import api from './api';

/**
 * Administrative Statistics Service
 */

const getDashboardStats = async () => {
    try {
        const response = await api.get('admin/stats');
        return response.data;
    } catch (error) {
        console.error('Fetch dashboard stats error:', error);
        throw error;
    }
};

export default {
    getDashboardStats
};
