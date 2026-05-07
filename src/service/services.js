import api from './api';

/**
 * Platform Services Management Service
 */

const listServices = async (params = {}) => {
    try {
        const response = await api.get('admin/services', { params });
        return response.data;
    } catch (error) {
        console.error('List services error:', error);
        throw error;
    }
};

const createService = async (data) => {
    try {
        const response = await api.post('admin/services', data);
        return response.data;
    } catch (error) {
        console.error('Create service error:', error);
        throw error;
    }
};

const updateService = async (id, data) => {
    try {
        const response = await api.patch(`admin/services/${id}`, data);
        return response.data;
    } catch (error) {
        console.error('Update service error:', error);
        throw error;
    }
};

const deleteService = async (id) => {
    try {
        const response = await api.delete(`admin/services/${id}`);
        return response.data;
    } catch (error) {
        console.error('Delete service error:', error);
        throw error;
    }
};

export default {
    listServices,
    createService,
    updateService,
    deleteService
};
