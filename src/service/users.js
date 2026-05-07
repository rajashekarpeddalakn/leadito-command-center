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

const deactivateUser = async (id) => {
    try {
        const response = await api.patch(`admin/users/${id}/deactivate`);
        return response.data;
    } catch (error) {
        console.error('Deactivate user error:', error);
        throw error;
    }
};

const deleteUser = async (id) => {
    try {
        const response = await api.delete(`admin/users/${id}`);
        return response.data;
    } catch (error) {
        console.error('Delete user error:', error);
        throw error;
    }
};

export default {
    listUsers,
    getUser,
    activateUser,
    deactivateUser,
    deleteUser
};
