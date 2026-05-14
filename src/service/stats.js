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

const updateManualRevenue = async (data) => {
    try {
        const response = await api.patch('admin/settings', data);
        return response.data;
    } catch (error) {
        console.error('Update setting error:', error);
        throw error;
    }
};

export default {
    getDashboardStats,
    updateManualRevenue
};
