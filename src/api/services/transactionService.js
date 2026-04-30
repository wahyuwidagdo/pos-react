import api from '../axios';

export const transactionService = {
    getAll: async (params) => {
        const response = await api.get('/transactions', { params });
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`/transactions/${id}`);
        return response.data;
    },

    create: async (data) => {
        const response = await api.post('/transactions', data);
        return response.data;
    },

    cancel: async (id) => {
        const response = await api.post(`/transactions/${id}/cancel`);
        return response.data;
    },

    return: async (id) => {
        const response = await api.post(`/transactions/${id}/return`);
        return response.data;
    },
};
