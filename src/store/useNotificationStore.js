import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Notification types:
 * - stock_alert: Low stock / out of stock warning
 * - transaction: New transaction completed
 * - system: System messages (updates, etc)
 */

const useNotificationStore = create(
    persist(
        (set, get) => ({
            notifications: [],
            unreadCount: 0,

            addNotification: (notification) => {
                const newNotification = {
                    id: Date.now() + Math.random(),
                    read: false,
                    timestamp: new Date().toISOString(),
                    ...notification,
                };
                set((state) => ({
                    notifications: [newNotification, ...state.notifications].slice(0, 50), // Keep max 50
                    unreadCount: state.unreadCount + 1,
                }));
            },

            markAsRead: (id) => {
                set((state) => ({
                    notifications: state.notifications.map((n) =>
                        n.id === id ? { ...n, read: true } : n
                    ),
                    unreadCount: Math.max(0, state.unreadCount - 1),
                }));
            },

            markAllAsRead: () => {
                set((state) => ({
                    notifications: state.notifications.map((n) => ({ ...n, read: true })),
                    unreadCount: 0,
                }));
            },

            removeNotification: (id) => {
                set((state) => {
                    const notification = state.notifications.find((n) => n.id === id);
                    return {
                        notifications: state.notifications.filter((n) => n.id !== id),
                        unreadCount: notification && !notification.read
                            ? Math.max(0, state.unreadCount - 1)
                            : state.unreadCount,
                    };
                });
            },

            clearAll: () => set({ notifications: [], unreadCount: 0 }),
        }),
        {
            name: 'kala-notifications',
        }
    )
);

export default useNotificationStore;
