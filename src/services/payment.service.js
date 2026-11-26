import api, { unwrap } from './api';

// Payment is internal: checkout goes through order.service.js.
// Only add UI for this if the optional GET /payments/:paymentId is exposed via the gateway.
export async function getPayment(paymentId) {
    return unwrap(await api.get(`/payments/${paymentId}`));
}