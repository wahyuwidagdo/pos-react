import { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { productService } from '../api/services';
import useNotificationStore from '../store/useNotificationStore';
import useAuthStore from '../store/useAuthStore';

/**
 * Hook that monitors stock levels and generates notifications
 * for low-stock and out-of-stock products.
 * Runs every 5 minutes and only generates new alerts when stock changes.
 */
export default function useStockAlerts() {
    const { addNotification } = useNotificationStore();
    const { user } = useAuthStore();
    const lastAlertedRef = useRef(new Set());
    const role = user?.role?.toLowerCase() || '';

    const { data } = useQuery({
        queryKey: ['stock-alerts'],
        queryFn: async () => {
            // Fetch products with low/zero stock
            const res = await productService.getAll({
                page: 1,
                pageSize: 100,
                stockFilter: 'low',
                sortBy: 'stock',
                sortOrder: 'asc',
            });
            return res.data?.data || [];
        },
        enabled: ['admin', 'manager'].includes(role),
        refetchInterval: 5 * 60 * 1000, // 5 minutes
        staleTime: 4 * 60 * 1000,
    });

    useEffect(() => {
        if (!data || data.length === 0) return;

        const outOfStock = data.filter(p => p.stock === 0);
        const lowStock = data.filter(p => p.stock > 0 && p.stock <= 5);

        // Only alert about products we haven't already alerted about
        outOfStock.forEach(product => {
            const key = `out_${product.id}`;
            if (!lastAlertedRef.current.has(key)) {
                lastAlertedRef.current.add(key);
                addNotification({
                    type: 'warning',
                    title: `Out of Stock: ${product.name}`,
                    message: `${product.name} (SKU: ${product.sku}) is out of stock. Restock immediately.`,
                });
            }
        });

        lowStock.forEach(product => {
            const key = `low_${product.id}`;
            if (!lastAlertedRef.current.has(key)) {
                lastAlertedRef.current.add(key);
                addNotification({
                    type: 'stock_alert',
                    title: `Low Stock: ${product.name}`,
                    message: `${product.name} has only ${product.stock} units left.`,
                });
            }
        });
    }, [data, addNotification]);
}
