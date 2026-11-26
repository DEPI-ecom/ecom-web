const DEFAULT_CURRENCY = import.meta.env.VITE_DEFAULT_CURRENCY || 'USD';

// Display only: never use the result of this for calculations.
export function formatMoney(value, currency) {
    if (value === null || value === undefined || value === '') return '—';
    const number = Number(value);
    if (Number.isNaN(number)) return String(value);
    return new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency: currency || DEFAULT_CURRENCY,
    }).format(number);
}

export function formatDate(iso) {
    if (!iso) return '—';
    return new Date(iso).toLocaleString();
}

export const ORDER_STATUS_LABELS = {
    PENDING_PAYMENT: 'Pending payment',
    PAID: 'Paid',
    PAYMENT_FAILED: 'Payment failed',
    CANCELLED: 'Cancelled',
};

export const statusLabel = (status) => ORDER_STATUS_LABELS[status] ?? status;