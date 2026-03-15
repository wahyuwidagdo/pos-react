import api from './axios';

export const transactionService = {
    // Get all transactions (with optional filters in future)
    getAllTransactions: async (params) => {
        const response = await api.get('/transactions', { params });
        return response.data;
    },

    // Get single transaction detail
    getTransactionById: async (id) => {
        const response = await api.get(`/transactions/${id}`);
        return response.data;
    },

    // Create new transaction
    createTransaction: async (data) => {
        const response = await api.post('/transactions', data);
        return response.data;
    },

    // Cancel a transaction
    cancelTransaction: async (id) => {
        const response = await api.post(`/transactions/${id}/cancel`);
        return response.data;
    },

    // Return a transaction (customer return)
    returnTransaction: async (id) => {
        const response = await api.post(`/transactions/${id}/return`);
        return response.data;
    },
};
