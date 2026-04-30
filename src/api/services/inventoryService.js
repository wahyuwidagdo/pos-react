import api from '../axios';

export const inventoryService = {
    getAll: async (params) => {
        const response = await api.get('/inventory', { params });
        return response.data;
    },

    adjustStock: async (data) => {
        const response = await api.post('/inventory', data);
        return response.data;
    },

    getStats: async (params) => {
        const response = await api.get('/inventory/stats', { params });
        return response.data;
    },
};
