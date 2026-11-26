import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import StatusMessage, { ErrorMessage } from '../components/StatusMessage';
import useAsync from '../hooks/useAsync';
import { getOrder, getOrderStatus } from '../services/order.service';
import { formatDate, formatMoney, statusLabel } from '../utils/format';

export default function OrderDetails() {
    const { orderId } = useParams();
    const { data, loading, error } = useAsync(() => getOrder(orderId), [orderId]);
    const [latest, setLatest] = useState(null); // result of the lightweight status refresh
    const [refreshing, setRefreshing] = useState(false);
    const [refreshError, setRefreshError] = useState(null);

    async function handleRefresh() {
        setRefreshing(true);
        setRefreshError(null);
        try {
            setLatest(await getOrderStatus(orderId));
        } catch (err) {
            setRefreshError(err);
        } finally {
            setRefreshing(false);
        }
    }

    if (loading) return <div className="container"><StatusMessage>Loading order…</StatusMessage></div>;
    if (error) {
        return (
            <div className="container">
                <ErrorMessage error={error} fallback="Could not load this order." />
                <Link to="/orders">Back to orders</Link>
            </div>
        );
    }
    if (!data) return null;

    const { order, payment } = data;
    const status = latest?.status ?? order.status;
    const items = order.items ?? [];
    // Field names of the shipping snapshot aren't in the API doc yet; confirm with the Order service.
    const shipping = order.shippingAddress && typeof order.shippingAddress === 'object' ? order.shippingAddress : null;

    return (
        <div className="container">
            <p>
                <Link to="/orders">← Back to orders</Link>
            </p>
            <h1>Order {order.id}</h1>

            <p>
                Status: <span className={`badge badge-${status}`}>{statusLabel(status)}</span>{' '}
                <button type="button" onClick={handleRefresh} disabled={refreshing}>
                    {refreshing ? 'Refreshing…' : 'Refresh status'}
                </button>
            </p>
            <ErrorMessage error={refreshError} fallback="Could not refresh the status." />
            {latest?.updatedAt && <p className="muted">Last updated {formatDate(latest.updatedAt)}</p>}
            <p className="muted">Placed {formatDate(order.createdAt)}</p>

            {status === 'PAYMENT_FAILED' && (
                <StatusMessage type="error">
                    The simulated payment failed. Your cart was kept, so you can <Link to="/checkout">check out again</Link>.
                </StatusMessage>
            )}

            <h2>Items</h2>
            <ul className="cart-list">
                {items.map((item, index) => (
                    <li key={item.id ?? item.productId ?? index} className="cart-item">
                        <div className="cart-item-info">
                            <Link to={`/products/${item.productId}`}>{item.productName}</Link>
                            <p className="muted">
                                {item.quantity} × {formatMoney(item.unitPrice, order.currency)}
                            </p>
                        </div>
                        <p className="line-total">{formatMoney(item.lineTotal, order.currency)}</p>
                    </li>
                ))}
            </ul>

            <div className="cart-summary">
                <p>Subtotal: {formatMoney(order.subtotal, order.currency)}</p>
                <p>
                    Total: <strong>{formatMoney(order.total, order.currency)}</strong>
                </p>
            </div>

            {payment && (
                <section>
                    <h2>Payment (simulated)</h2>
                    <p>Status: {payment.status}</p>
                    {payment.mockReference && <p className="muted">Reference: {payment.mockReference}</p>}
                    {payment.failureReason && <p className="text-error">{payment.failureReason}</p>}
                </section>
            )}

            {shipping && (
                <section>
                    <h2>Shipping address</h2>
                    <p>
                        {[shipping.recipientName, shipping.phone, shipping.street, shipping.city, shipping.state, shipping.postalCode]
                            .filter(Boolean)
                            .join(', ')}
                    </p>
                </section>
            )}
        </div>
    );
}