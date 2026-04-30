import api from '../axios';

export const dashboardService = {
    getDashboard: async (params) => {
        const response = await api.get('/dashboard', { params });
        return response.data;
    },
};
