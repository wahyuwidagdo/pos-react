import api from '../axios';

export const reportService = {
    getSalesReport: async (params) => {
        const response = await api.get('/reports/sales', { params });
        return response.data;
    },

    getProductReport: async (params) => {
        const response = await api.get('/reports/products', { params });
        return response.data;
    },

    getStockValue: async () => {
        const response = await api.get('/reports/stock-value');
        return response.data;
    },
};
