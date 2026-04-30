import { describe, it, expect, beforeEach } from 'vitest';
import useCartStore from '../../src/store/useCartStore';

describe('useCartStore', () => {
    beforeEach(() => {
        // Reset state before each test
        useCartStore.setState({ items: [], total: 0 });
    });

    it('adds a new product to the cart', () => {
        const store = useCartStore.getState();
        store.addToCart({ id: 1, name: 'Product A', price: 100, stock: 10 });
        
        const state = useCartStore.getState();
        expect(state.items.length).toBe(1);
        expect(state.items[0]).toMatchObject({ id: 1, quantity: 1 });
        expect(store.getTotal()).toBe(100);
    });

    it('increments quantity when adding the same product', () => {
        const store = useCartStore.getState();
        store.addToCart({ id: 1, name: 'Product A', price: 100, stock: 10 });
        store.addToCart({ id: 1, name: 'Product A', price: 100, stock: 10 });
        
        const state = useCartStore.getState();
        expect(state.items.length).toBe(1);
        expect(state.items[0].quantity).toBe(2);
        expect(store.getTotal()).toBe(200);
    });

    it('updates quantity of an item', () => {
        const store = useCartStore.getState();
        store.addToCart({ id: 1, name: 'Product A', price: 100, stock: 10 });
        store.updateQuantity(1, 5);
        
        const state = useCartStore.getState();
        expect(state.items[0].quantity).toBe(5);
        expect(store.getTotal()).toBe(500);
    });

    it('removes an item from the cart', () => {
        const store = useCartStore.getState();
        store.addToCart({ id: 1, name: 'Product A', price: 100, stock: 10 });
        store.addToCart({ id: 2, name: 'Product B', price: 200, stock: 10 });
        
        store.removeFromCart(1);
        
        const state = useCartStore.getState();
        expect(state.items.length).toBe(1);
        expect(state.items[0].id).toBe(2);
        expect(store.getTotal()).toBe(200);
    });

    it('clears the cart', () => {
        const store = useCartStore.getState();
        store.addToCart({ id: 1, name: 'Product A', price: 100, stock: 10 });
        
        store.clearCart();
        
        const state = useCartStore.getState();
        expect(state.items.length).toBe(0);
        expect(store.getTotal()).toBe(0);
    });
});
