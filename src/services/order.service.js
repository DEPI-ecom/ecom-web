import api, { cleanParams, unwrap } from './api';

// Returns { order, payment }. The mock outcome is part of the checkout request (simulation only).
export async function checkout({ addressId, mockPaymentOutcome }, idempotencyKey) {
    const res = await api.post(
        '/orders/checkout',
        { addressId, mockPaymentOutcome },
        { headers: { 'Idempotency-Key': idempotencyKey } }
    );
    return unwrap(res);
}

// List responses use { data: [...], meta: {...} }
export async function listOrders(params = {}) {
    const res = await api.get('/orders', { params: cleanParams(params) });
    return { orders: res.data?.data ?? [], meta: res.data?.meta ?? null };
}

export async function getOrder(orderId) {
    const data = unwrap(await api.get(`/orders/${orderId}`));
    const order = data.order ?? data;
    return { order, payment: data.payment ?? order.payment ?? null };
}

// { orderId, status, updatedAt }
export async function getOrderStatus(orderId) {
    return unwrap(await api.get(`/orders/${orderId}/status`));
}