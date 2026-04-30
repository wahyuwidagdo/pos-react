import { describe, it, expect, beforeEach, vi } from 'vitest';
import api from '../../../src/api/axios';
import { authService } from '../../../src/api/services';

vi.mock('../../../src/api/axios', () => {
    return {
        default: {
            post: vi.fn(),
            get: vi.fn(),
            put: vi.fn(),
        }
    };
});

describe('authService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('login returns token on success', async () => {
        const mockResponse = { data: { token: 'mock-token' } };
        api.post.mockResolvedValueOnce(mockResponse);

        const result = await authService.login({ username: 'admin', password: 'password' });
        
        expect(api.post).toHaveBeenCalledWith('/auth/login', {
            username: 'admin',
            password: 'password',
        });
        expect(result).toEqual(mockResponse.data);
    });

    it('login throws error on failure', async () => {
        const mockError = new Error('Invalid credentials');
        api.post.mockRejectedValueOnce(mockError);

        await expect(authService.login({ username: 'admin', password: 'wrong' })).rejects.toThrow('Invalid credentials');
    });

    it('getProfile fetches user data', async () => {
        const mockResponse = { data: { id: 1, username: 'admin' } };
        api.get.mockResolvedValueOnce(mockResponse);

        const result = await authService.getProfile();
        
        expect(api.get).toHaveBeenCalledWith('/auth/profile');
        expect(result).toEqual(mockResponse.data);
    });
});
