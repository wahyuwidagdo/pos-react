import { create } from 'zustand';
import { authService } from '../api/services';

// Helper to decode JWT payload
function decodeJWT(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64).split('').map(c =>
                '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
            ).join('')
        );
        return JSON.parse(jsonPayload);
    } catch (e) {
        return null;
    }
}

const useAuthStore = create((set, get) => ({
    user: (() => {
        try {
            const item = localStorage.getItem('user');
            return item ? JSON.parse(item) : null;
        } catch (e) {
            localStorage.removeItem('user');
            return null;
        }
    })(),
    token: localStorage.getItem('token') || null,
    isAuthenticated: !!localStorage.getItem('token'),
    isLoading: false,
    error: null,

    login: async (username, password) => {
        set({ isLoading: true, error: null });
        try {
            const response = await authService.login({ username, password });
            const { data } = response; // { token, user }

            const user = data.user || decodeJWT(data.token);

            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(user));

            set({
                user,
                token: data.token,
                isAuthenticated: true,
                isLoading: false
            });
            return true;
        } catch (err) {
            const message = err.response?.data?.error || 'Login failed';
            set({ error: message, isLoading: false });
            return false;
        }
    },

    // Fetch profile from server and update store
    fetchProfile: async () => {
        try {
            const response = await authService.getProfile();
            const user = response.data;
            localStorage.setItem('user', JSON.stringify(user));
            set({ user });
            return user;
        } catch (err) {
            console.error('Failed to fetch profile:', err);
            return null;
        }
    },

    // Update user in store (after profile edit)
    setUser: (user) => {
        localStorage.setItem('user', JSON.stringify(user));
        set({ user });
    },

    // Check if user has required role
    hasRole: (...roles) => {
        const { user } = get();
        if (!user || !user.role) return false;
        return roles.some(r => r.toLowerCase() === user.role.toLowerCase());
    },

    // Check if user is admin or manager
    isAdminOrManager: () => {
        const { user } = get();
        if (!user || !user.role) return false;
        const role = user.role.toLowerCase();
        return role === 'admin' || role === 'manager';
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        set({ user: null, token: null, isAuthenticated: false });
    },
}));

export default useAuthStore;
