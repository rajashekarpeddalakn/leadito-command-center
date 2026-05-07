import api from './api';

/**
 * Video Management Service
 * Handles CRUD operations and file uploads for videos.
 */

const listVideos = async (params = {}) => {
    try {
        const response = await api.get('admin/videos', { params });
        return response.data;
    } catch (error) {
        console.error('List videos error:', error);
        throw error;
    }
};

const createVideo = async (videoData) => {
    try {
        // If files are present, use FormData for multipart/form-data upload
        if (videoData.videoFile || videoData.thumbnailFile) {
            const formData = new FormData();

            // Add text fields
            formData.append('title', videoData.title);
            if (videoData.description) formData.append('description', videoData.description);
            formData.append('isActive', videoData.isActive !== undefined ? videoData.isActive : true);

            // Add files
            if (videoData.videoFile) {
                formData.append('video', videoData.videoFile);
            }
            if (videoData.thumbnailFile) {
                formData.append('thumbnail', videoData.thumbnailFile);
            }

            // In case the backend expects URLs even with files (e.g. if already uploaded via S3 pre-signed)
            if (videoData.videoUrl) formData.append('videoUrl', videoData.videoUrl);
            if (videoData.thumbnailUrl) formData.append('thumbnailUrl', videoData.thumbnailUrl);

            const response = await api.post('admin/videos', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        }

        // Standard JSON request if no files
        const response = await api.post('admin/videos', videoData);
        return response.data;
    } catch (error) {
        console.error('Create video error:', error);
        throw error;
    }
};

const updateVideo = async (id, videoData) => {
    try {
        if (videoData.videoFile || videoData.thumbnailFile) {
            const formData = new FormData();

            // Append all keys to formData
            Object.keys(videoData).forEach(key => {
                if (key === 'videoFile') {
                    formData.append('video', videoData[key]);
                } else if (key === 'thumbnailFile') {
                    formData.append('thumbnail', videoData[key]);
                } else {
                    // Append numbers consistently
                    formData.append(key, videoData[key]);
                }
            });

            const response = await api.patch(`admin/videos/${id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        }

        const response = await api.patch(`admin/videos/${id}`, videoData);
        return response.data;
    } catch (error) {
        console.error('Update video error:', error);
        throw error;
    }
};

const deleteVideo = async (id) => {
    try {
        const response = await api.delete(`admin/videos/${id}`);
        return response.data;
    } catch (error) {
        console.error('Delete video error:', error);
        throw error;
    }
};

export default {
    listVideos,
    createVideo,
    updateVideo,
    deleteVideo,
};
