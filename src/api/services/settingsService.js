import api from '../axios';

export const settingsService = {
    getStoreSettings: async () => {
        const response = await api.get('/store-settings');
        return response.data;
    },

    updateStoreSettings: async (data) => {
        const response = await api.put('/store-settings', data);
        return response.data;
    },

    getPaymentMethods: async () => {
        const response = await api.get('/payment-methods');
        return response.data;
    },

    getActivePaymentMethods: async () => {
        const response = await api.get('/payment-methods/active');
        return response.data;
    },

    createPaymentMethod: async (data) => {
        const response = await api.post('/payment-methods', data);
        return response.data;
    },

    updatePaymentMethod: async (id, data) => {
        const response = await api.put(`/payment-methods/${id}`, data);
        return response.data;
    },

    deletePaymentMethod: async (id) => {
        const response = await api.delete(`/payment-methods/${id}`);
        return response.data;
    },
};
