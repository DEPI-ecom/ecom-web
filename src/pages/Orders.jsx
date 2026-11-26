import { Link, useSearchParams } from 'react-router-dom';
import Pagination from '../components/Pagination';
import StatusMessage, { ErrorMessage } from '../components/StatusMessage';
import useAsync from '../hooks/useAsync';
import { listOrders } from '../services/order.service';
import { ORDER_STATUS_LABELS, formatDate, formatMoney, statusLabel } from '../utils/format';

const PAGE_SIZE = 10;

export default function Orders() {
    const [searchParams, setSearchParams] = useSearchParams();
    const page = Number(searchParams.get('page')) || 1;
    const status = searchParams.get('status') ?? '';

    const { data, loading, error } = useAsync(
        () => listOrders({ page, limit: PAGE_SIZE, status }),
        [page, status]
    );

    function updateParams(changes) {
        const next = new URLSearchParams(searchParams);
        Object.entries(changes).forEach(([key, value]) => {
            if (value) next.set(key, value);
            else next.delete(key);
        });
        setSearchParams(next);
    }

    const orders = data?.orders ?? [];
    const meta = data?.meta;

    return (
        <div className="container">
            <div className="results-header">
                <h1>Your orders</h1>
                <label>
                    Status{' '}
                    <select value={status} onChange={(e) => updateParams({ status: e.target.value, page: '' })}>
                        <option value="">All</option>
                        {Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => (
                            <option key={value} value={value}>
                                {label}
                            </option>
                        ))}
                    </select>
                </label>
            </div>

            {loading && <StatusMessage>Loading orders…</StatusMessage>}
            <ErrorMessage error={error} fallback="Could not load your orders." />

            {!loading && !error && orders.length === 0 && (
                <StatusMessage>
                    No orders found. <Link to="/products">Start shopping</Link>
                </StatusMessage>
            )}

            {orders.length > 0 && (
                <ul className="order-list">
                    {orders.map((order) => (
                        <li key={order.id} className="order-row">
                            <div>
                                <Link to={`/orders/${order.id}`}>Order {order.id}</Link>
                                <p className="muted">{formatDate(order.createdAt)}</p>
                            </div>
                            <span className={`badge badge-${order.status}`}>{statusLabel(order.status)}</span>
                            <strong>{formatMoney(order.total, order.currency)}</strong>
                        </li>
                    ))}
                </ul>
            )}

            <Pagination
                page={meta?.page ?? page}
                totalPages={meta?.totalPages}
                onChange={(nextPage) => updateParams({ page: String(nextPage) })}
            />
        </div>
    );
}