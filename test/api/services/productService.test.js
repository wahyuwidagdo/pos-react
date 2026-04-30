import { describe, it, expect, beforeEach, vi } from 'vitest';
import api from '../../../src/api/axios';
import { productService } from '../../../src/api/services';

vi.mock('../../../src/api/axios', () => {
    return {
        default: {
            get: vi.fn(),
            post: vi.fn(),
            put: vi.fn(),
            delete: vi.fn(),
        }
    };
});

describe('productService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('getAll fetches products with correct params', async () => {
        const mockResponse = { data: { data: [{ id: 1, name: 'Test Product' }], total: 1 } };
        api.get.mockResolvedValueOnce(mockResponse);

        const params = { page: 1, pageSize: 10 };
        const result = await productService.getAll(params);
        
        expect(api.get).toHaveBeenCalledWith('/products', { params });
        expect(result).toEqual(mockResponse.data);
    });

    it('create sends post request with correct payload', async () => {
        const payload = { name: 'New Product', price: 100 };
        api.post.mockResolvedValueOnce({});

        await productService.create(payload);
        
        expect(api.post).toHaveBeenCalledWith('/products', payload);
    });

    it('update sends put request with correct payload', async () => {
        const payload = { name: 'Updated Product' };
        api.put.mockResolvedValueOnce({});

        await productService.update(1, payload);
        
        expect(api.put).toHaveBeenCalledWith('/products/1', payload);
    });

    it('delete sends delete request', async () => {
        api.delete.mockResolvedValueOnce({});

        await productService.delete(1);
        
        expect(api.delete).toHaveBeenCalledWith('/products/1');
    });
});
