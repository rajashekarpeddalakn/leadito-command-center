import api from './api';

/**
 * Ads Reports Management Service
 */

const listAdsReports = async (params = {}) => {
    try {
        const response = await api.get('admin/ads-reports', { params });
        return response.data;
    } catch (error) {
        console.error('List ads reports error:', error);
        throw error;
    }
};

const createAdsReport = async (data) => {
    try {
        const payload = {
            ...data,
            platform: data.platform || 'meta'
        };
        const response = await api.post('admin/ads-reports', payload);
        return response.data;
    } catch (error) {
        console.error('Create ads report error:', error);
        throw error;
    }
};

const updateAdsReport = async (id, data) => {
    try {
        const response = await api.patch(`admin/ads-reports/${id}`, data);
        return response.data;
    } catch (error) {
        console.error('Update ads report error:', error);
        throw error;
    }
};

const deleteAdsReport = async (id) => {
    try {
        const response = await api.delete(`admin/ads-reports/${id}`);
        return response.data;
    } catch (error) {
        console.error('Delete ads report error:', error);
        throw error;
    }
};

export default {
    listAdsReports,
    createAdsReport,
    updateAdsReport,
    deleteAdsReport
};
