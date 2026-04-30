import api from '../axios';

export const productService = {
    getAll: async (params) => {
        const response = await api.get('/products', { params });
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`/products/${id}`);
        return response.data;
    },

    create: async (data) => {
        const response = await api.post('/products', data);
        return response.data;
    },

    update: async (id, data) => {
        const response = await api.put(`/products/${id}`, data);
        return response.data;
    },

    delete: async (id) => {
        const response = await api.delete(`/products/${id}`);
        return response.data;
    },

    restore: async (id) => {
        const response = await api.post(`/products/${id}/restore`);
        return response.data;
    },

    forceDelete: async (id) => {
        const response = await api.delete(`/products/${id}/force`);
        return response.data;
    },

    getStockCounts: async () => {
        const response = await api.get('/products/stock-counts');
        return response.data;
    },

    getLowStock: async (threshold) => {
        const response = await api.get('/products/low-stock', { params: { threshold } });
        return response.data;
    },
};
