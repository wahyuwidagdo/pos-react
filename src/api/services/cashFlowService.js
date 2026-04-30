import api from '../axios';

export const cashFlowService = {
    getAll: async (params) => {
        const response = await api.get('/cash-flow', { params });
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`/cash-flow/${id}`);
        return response.data;
    },

    create: async (data) => {
        const response = await api.post('/cash-flow', data);
        return response.data;
    },

    update: async (id, data) => {
        const response = await api.put(`/cash-flow/${id}`, data);
        return response.data;
    },

    delete: async (id) => {
        const response = await api.delete(`/cash-flow/${id}`);
        return response.data;
    },

    getSummary: async (params) => {
        const response = await api.get('/cash-flow/summary', { params });
        return response.data;
    },
};
