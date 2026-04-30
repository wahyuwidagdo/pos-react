import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import useStockAlerts from '../../src/hooks/useStockAlerts';
import { productService } from '../../src/api/services';
import useAuthStore from '../../src/store/useAuthStore';
import useNotificationStore from '../../src/store/useNotificationStore';

vi.mock('../../src/api/services', () => ({
    productService: {
        getAll: vi.fn(),
    }
}));

vi.mock('../../src/store/useAuthStore', () => ({
    default: vi.fn(),
}));

vi.mock('../../src/store/useNotificationStore', () => ({
    default: vi.fn(),
}));

const queryClient = new QueryClient({
    defaultOptions: {
        queries: { retry: false },
    },
});

const wrapper = ({ children }) => (
    <QueryClientProvider client={queryClient}>
        {children}
    </QueryClientProvider>
);

describe('useStockAlerts', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        queryClient.clear();
    });

    it('generates notifications for low stock and out of stock products', async () => {
        const mockProducts = [
            { id: 1, name: 'Product A', stock: 5, sku: 'SKU1' },
            { id: 2, name: 'Product B', stock: 0, sku: 'SKU2' },
            { id: 3, name: 'Product C', stock: 10, sku: 'SKU3' }
        ];
        
        productService.getAll.mockResolvedValueOnce({ data: { data: mockProducts } });
        
        const mockAddNotification = vi.fn();
        useNotificationStore.mockReturnValue({ addNotification: mockAddNotification });
        useAuthStore.mockReturnValue({ user: { role: 'admin' } });

        renderHook(() => useStockAlerts(), { wrapper });

        await waitFor(() => {
            expect(mockAddNotification).toHaveBeenCalledTimes(2);
        });

        expect(mockAddNotification).toHaveBeenCalledWith(expect.objectContaining({
            type: 'stock_alert',
            title: 'Low Stock: Product A'
        }));

        expect(mockAddNotification).toHaveBeenCalledWith(expect.objectContaining({
            type: 'warning',
            title: 'Out of Stock: Product B'
        }));
    });

    it('does not fetch or notify if user is not admin/manager', async () => {
        useAuthStore.mockReturnValue({ user: { role: 'cashier' } });
        const mockAddNotification = vi.fn();
        useNotificationStore.mockReturnValue({ addNotification: mockAddNotification });

        renderHook(() => useStockAlerts(), { wrapper });

        // Wait to ensure no calls were made
        await new Promise(r => setTimeout(r, 100));

        expect(productService.getAll).not.toHaveBeenCalled();
        expect(mockAddNotification).not.toHaveBeenCalled();
    });
});
