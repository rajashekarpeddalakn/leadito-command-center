import api from './api';

/**
 * Plans Management Service
 */

const listPlans = async (params = {}) => {
    try {
        const response = await api.get('admin/plans', { params });
        return response.data;
    } catch (error) {
        console.error('List plans error:', error);
        throw error;
    }
};

const createPlan = async (data) => {
    try {
        const response = await api.post('admin/plans', data);
        return response.data;
    } catch (error) {
        console.error('Create plan error:', error);
        throw error;
    }
};

const updatePlan = async (id, data) => {
    try {
        const response = await api.patch(`admin/plans/${id}`, data);
        return response.data;
    } catch (error) {
        console.error('Update plan error:', error);
        throw error;
    }
};

const deletePlan = async (id) => {
    try {
        const response = await api.delete(`admin/plans/${id}`);
        return response.data;
    } catch (error) {
        console.error('Delete plan error:', error);
        throw error;
    }
};

export default {
    listPlans,
    createPlan,
    updatePlan,
    deletePlan
};
