import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import StatusMessage, { ErrorMessage } from '../components/StatusMessage';
import { useCart } from '../context/CartContext';
import useAsync from '../hooks/useAsync';
import { checkout } from '../services/order.service';
import { listAddresses } from '../services/user.service';
import { getErrorCode } from '../utils/errors';
import { formatMoney } from '../utils/format';
import { newIdempotencyKey } from '../utils/idempotency';

export default function Checkout() {
    const { cart, loading: cartLoading, refreshCart } = useCart();
    const addressesState = useAsync(listAddresses, []);
    const addresses = addressesState.data ?? [];

    const [addressId, setAddressId] = useState('');
    const [outcome, setOutcome] = useState('SUCCESS');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [result, setResult] = useState(null);

    // One key per checkout attempt. Reused only if we never got a response (network error/timeout/5xx),
    // so a double-click or retry can't create two orders. Regenerated after any definitive response.
    const keyRef = useRef(null);
    if (!keyRef.current) keyRef.current = newIdempotencyKey();

    // Preselect the default address.
    useEffect(() => {
        if (addresses.length === 0) return;
        const preferred = addresses.find((a) => a.isDefault) ?? addresses[0];
        setAddressId((current) => current || preferred.id);
    }, [addresses]);

    async function handleSubmit(event) {
        event.preventDefault();
        if (submitting || !addressId) return;
        setSubmitting(true);
        setError(null);

        try {
            const data = await checkout({ addressId, mockPaymentOutcome: outcome }, keyRef.current);
            keyRef.current = newIdempotencyKey();
            setResult(data);
            await refreshCart(); // backend clears the cart on success; stay in sync
        } catch (err) {
            setError(err);
            if (err.response && err.response.status < 500) keyRef.current = newIdempotencyKey();
            const code = getErrorCode(err);
            if (code === 'INSUFFICIENT_STOCK' || code === 'EMPTY_CART') refreshCart();
        } finally {
            setSubmitting(false);
        }
    }

    function handleTryAgain() {
        setResult(null);
        setError(null);
        keyRef.current = newIdempotencyKey();
    }

    // Result first: after a successful checkout the cart is empty, so check this before the empty-cart state.
    if (result) {
        const { order, payment } = result;
        const paid = order.status === 'PAID';
        const failed = order.status === 'PAYMENT_FAILED';
        const heading = paid ? 'Order placed' : failed ? 'Payment failed' : 'Order processing';
        const type = paid ? 'success' : failed ? 'error' : 'info';
        const text = paid
            ? 'Your simulated payment succeeded.'
            : failed
                ? `${payment?.failureReason ?? 'Simulated payment failure'}. Your cart was kept so you can try again.`
                : 'Your order was received but is not confirmed yet. Check its status on the order page.';
        return (
            <div className="container narrow">
                <h1>{heading}</h1>
                <StatusMessage type={type}>{text}</StatusMessage>
                <p>
                    Order <strong>{order.id}</strong>: total {formatMoney(order.total, order.currency)}
                </p>
                {payment?.mockReference && <p className="muted">Mock payment reference: {payment.mockReference}</p>}
                <div className="form-actions">
                    <Link to={`/orders/${order.id}`}>View order</Link>
                    {failed && (
                        <button type="button" onClick={handleTryAgain}>
                            Try again
                        </button>
                    )}
                </div>
            </div>
        );
    }

    if (cartLoading && cart.items.length === 0) {
        return <div className="container"><StatusMessage>Loading…</StatusMessage></div>;
    }

    if (cart.items.length === 0) {
        return (
            <div className="container">
                <h1>Checkout</h1>
                <StatusMessage>Your cart is empty.</StatusMessage>
                <Link to="/products">Browse products</Link>
            </div>
        );
    }

    return (
        <div className="container">
            <h1>Checkout</h1>

            <div className="checkout-layout">
                <form className="form" onSubmit={handleSubmit}>
                    <fieldset>
                        <legend>Shipping address</legend>
                        {addressesState.loading && <p>Loading addresses…</p>}
                        <ErrorMessage error={addressesState.error} fallback="Could not load your addresses." />
                        {!addressesState.loading && !addressesState.error && addresses.length === 0 && (
                            <StatusMessage>
                                You have no saved addresses. <Link to="/profile">Add one in your profile</Link>, then come back.
                            </StatusMessage>
                        )}
                        {addresses.map((address) => (
                            <label key={address.id} className="radio">
                                <input
                                    type="radio"
                                    name="address"
                                    value={address.id}
                                    checked={addressId === address.id}
                                    onChange={() => setAddressId(address.id)}
                                />
                                <span>
                                    <strong>{address.label}</strong>: {address.recipientName}, {address.street}, {address.city}
                                    {address.state ? `, ${address.state}` : ''}
                                    {address.postalCode ? ` ${address.postalCode}` : ''}
                                </span>
                            </label>
                        ))}
                    </fieldset>

                    <fieldset>
                        <legend>Payment (simulation)</legend>
                        <StatusMessage>
                            This is a mock payment for demonstration. No card details are collected and no real payment is made.
                        </StatusMessage>
                        <label className="radio">
                            <input
                                type="radio"
                                name="outcome"
                                value="SUCCESS"
                                checked={outcome === 'SUCCESS'}
                                onChange={() => setOutcome('SUCCESS')}
                            />
                            Simulate successful payment
                        </label>
                        <label className="radio">
                            <input
                                type="radio"
                                name="outcome"
                                value="FAILURE"
                                checked={outcome === 'FAILURE'}
                                onChange={() => setOutcome('FAILURE')}
                            />
                            Simulate failed payment
                        </label>
                    </fieldset>

                    <ErrorMessage error={error} fallback="Checkout failed. Please try again." />

                    <button type="submit" disabled={submitting || !addressId}>
                        {submitting ? 'Placing order…' : 'Place order'}
                    </button>
                </form>

                <aside className="order-summary">
                    <h2>Order summary</h2>
                    <ul className="plain-list">
                        {cart.items.map((item) => (
                            <li key={item.id}>
                                {item.quantity} × {item.product?.name ?? 'Product'}: {formatMoney(item.lineTotal, cart.currency)}
                            </li>
                        ))}
                    </ul>
                    <p>
                        Subtotal: <strong>{formatMoney(cart.subtotal, cart.currency)}</strong>
                    </p>
                    <p className="muted">The server re-checks prices and stock when you place the order.</p>
                    <Link to="/cart">Edit cart</Link>
                </aside>
            </div>
        </div>
    );
}