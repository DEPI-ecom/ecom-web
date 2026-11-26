import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as cartService from '../services/cart.service';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

const EMPTY_CART = { id: null, items: [], subtotal: '0.00', currency: undefined };
const normalize = (cart) => ({ ...EMPTY_CART, ...cart, items: cart?.items ?? [] });

export function CartProvider({ children }) {
    const { isAuthenticated } = useAuth();
    const [cart, setCart] = useState(EMPTY_CART);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const refreshCart = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            setCart(normalize(await cartService.getCart()));
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    }, []);

    // Load the cart on login, clear it on logout.
    useEffect(() => {
        if (isAuthenticated) {
            refreshCart();
        } else {
            setCart(EMPTY_CART);
            setError(null);
        }
    }, [isAuthenticated, refreshCart]);

    // Mutations throw so the calling component can show its own error message.
    const addItem = useCallback(async (productId, quantity = 1) => {
        setCart(normalize(await cartService.addItem(productId, quantity)));
    }, []);

    const updateItem = useCallback(async (itemId, quantity) => {
        setCart(normalize(await cartService.updateItem(itemId, quantity)));
    }, []);

    const removeItem = useCallback(
        async (itemId) => {
            await cartService.removeItem(itemId); // 204, so re-fetch for the new subtotal
            await refreshCart();
        },
        [refreshCart]
    );

    const clearCart = useCallback(async () => {
        await cartService.clearCart();
        setCart(EMPTY_CART);
    }, []);

    const itemCount = cart.items.reduce((total, item) => total + item.quantity, 0);

    const value = useMemo(
        () => ({ cart, itemCount, loading, error, refreshCart, addItem, updateItem, removeItem, clearCart }),
        [cart, itemCount, loading, error, refreshCart, addItem, updateItem, removeItem, clearCart]
    );

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) throw new Error('useCart must be used inside <CartProvider>');
    return context;
}