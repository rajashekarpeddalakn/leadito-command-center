import api from './api';

/**
 * Testimonials Management Service
 */

const listTestimonials = async (params = {}) => {
    try {
        const response = await api.get('admin/testimonials', { params });
        return response.data;
    } catch (error) {
        console.error('List testimonials error:', error);
        throw error;
    }
};

const createTestimonial = async (data) => {
    try {
        const response = await api.post('admin/testimonials', data);
        return response.data;
    } catch (error) {
        console.error('Create testimonial error:', error);
        throw error;
    }
};

const updateTestimonial = async (id, data) => {
    try {
        const response = await api.patch(`admin/testimonials/${id}`, data);
        return response.data;
    } catch (error) {
        console.error('Update testimonial error:', error);
        throw error;
    }
};

const deleteTestimonial = async (id) => {
    try {
        const response = await api.delete(`admin/testimonials/${id}`);
        return response.data;
    } catch (error) {
        console.error('Delete testimonial error:', error);
        throw error;
    }
};

export default {
    listTestimonials,
    createTestimonial,
    updateTestimonial,
    deleteTestimonial
};
