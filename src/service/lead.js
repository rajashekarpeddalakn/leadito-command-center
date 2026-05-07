import api from './api';

/**
 * Leads Management Service
 */

const listLeads = async (params = {}) => {
    try {
        const response = await api.get('admin/leads', { params });
        return response.data;
    } catch (error) {
        console.error('List leads error:', error);
        throw error;
    }
};

const getLeadNotes = async (leadId, params = {}) => {
    try {
        const response = await api.get(`admin/leads/${leadId}/notes`, { params });
        return response.data;
    } catch (error) {
        console.error('Get lead notes error:', error);
        throw error;
    }
};

export default {
    listLeads,
    getLeadNotes
};
