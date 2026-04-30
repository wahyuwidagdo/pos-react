import api from '../axios';

export const authService = {
    login: async (credentials) => {
        const response = await api.post('/auth/login', credentials);
        return response.data;
    },

    register: async (data) => {
        const response = await api.post('/auth/register', data);
        return response.data;
    },

    getProfile: async () => {
        const response = await api.get('/auth/profile');
        return response.data;
    },

    updateProfile: async (data) => {
        const response = await api.put('/auth/profile', data);
        return response.data;
    },

    changePassword: async (data) => {
        const response = await api.put('/auth/password', data);
        return response.data;
    },
};
