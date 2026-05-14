import api from './api';

/**
 * Users Management Service
 */

const listUsers = async (params = {}) => {
    try {
        const response = await api.get('admin/users', { params });
        return response.data;
    } catch (error) {
        console.error('List users error:', error);
        throw error;
    }
};

const getUser = async (id) => {
    try {
        const response = await api.get(`admin/users/${id}`);
        return response.data;
    } catch (error) {
        console.error('Get user error:', error);
        throw error;
    }
};

const activateUser = async (id, planId) => {
    try {
        const response = await api.patch(`admin/users/${id}/activate`, { planId });
        return response.data;
    } catch (error) {
        console.error('Activate user error:', error);
        throw error;
    }
};

const toggleStatus = async (id) => {
    try {
        const response = await api.patch(`admin/users/${id}/toggle-status`);
        return response.data;
    } catch (error) {
        console.error('Toggle status error:', error);
        throw error;
    }
};

const listPendingSubscriptions = async () => {
    try {
        const response = await api.get('admin/subscriptions/pending');
        return response.data;
    } catch (error) {
        console.error('List pending subscriptions error:', error);
        throw error;
    }
};

const approveSubscription = async (subId) => {
    try {
        const response = await api.post(`admin/subscriptions/${subId}/approve`);
        return response.data;
    } catch (error) {
        console.error('Approve subscription error:', error);
        throw error;
    }
};

const updateLeadInfo = async (id, data) => {
    try {
        const response = await api.patch(`admin/users/${id}/lead-info`, data);
        return response.data;
    } catch (error) {
        console.error('Update lead info error:', error);
        throw error;
    }
};

export default {
    listUsers,
    getUser,
    activateUser,
    toggleStatus,
    listPendingSubscriptions,
    approveSubscription,
    updateLeadInfo
};
