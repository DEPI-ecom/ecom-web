import api, { unwrap } from './api';

// Cart contract is planned, not yet verified. Mutations return the updated cart.
export async function getCart() {
    return unwrap(await api.get('/cart'), 'cart');
}

export async function addItem(productId, quantity = 1) {
    return unwrap(await api.post('/cart/items', { productId, quantity }), 'cart');
}

export async function updateItem(itemId, quantity) {
    return unwrap(await api.put(`/cart/items/${itemId}`, { quantity }), 'cart');
}

export async function removeItem(itemId) {
    await api.delete(`/cart/items/${itemId}`); // 204
}

export async function clearCart() {
    await api.delete('/cart'); // 204
}