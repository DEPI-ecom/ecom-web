import { useState } from 'react';
import { Link } from 'react-router-dom';
import StatusMessage, { ErrorMessage } from '../components/StatusMessage';
import { useCart } from '../context/CartContext';
import { getErrorMessage } from '../utils/errors';
import { formatMoney } from '../utils/format';

export default function Cart() {
    const { cart, loading, error, updateItem, removeItem, clearCart } = useCart();
    const [busyId, setBusyId] = useState(null); // item id, or 'all' while clearing
    const [actionError, setActionError] = useState('');

    async function run(id, action) {
        setBusyId(id);
        setActionError('');
        try {
            await action();
        } catch (err) {
            setActionError(getErrorMessage(err));
        } finally {
            setBusyId(null);
        }
    }

    function handleClear() {
        if (window.confirm('Remove all items from your cart?')) run('all', clearCart);
    }

    if (loading && cart.items.length === 0) {
        return <div className="container"><StatusMessage>Loading your cart…</StatusMessage></div>;
    }

    if (error && cart.items.length === 0) {
        return <div className="container"><ErrorMessage error={error} fallback="Could not load your cart." /></div>;
    }

    if (cart.items.length === 0) {
        return (
            <div className="container">
                <h1>Your cart</h1>
                <StatusMessage>Your cart is empty.</StatusMessage>
                <Link to="/products">Browse products</Link>
            </div>
        );
    }

    return (
        <div className="container">
            <h1>Your cart</h1>
            {actionError && <StatusMessage type="error">{actionError}</StatusMessage>}

            <ul className="cart-list">
                {cart.items.map((item) => {
                    const stock = item.product?.stockQuantity ?? item.product?.stock;
                    const busy = busyId === item.id || busyId === 'all';
                    return (
                        <li key={item.id} className="cart-item">
                            {item.product?.imageUrl ? (
                                <img src={item.product.imageUrl} alt={item.product.name} />
                            ) : (
                                <div className="image-placeholder small">No image</div>
                            )}

                            <div className="cart-item-info">
                                <Link to={`/products/${item.productId}`}>{item.product?.name ?? 'Product'}</Link>
                                <p className="muted">{formatMoney(item.product?.price, cart.currency)} each</p>
                            </div>

                            <div className="quantity-controls">
                                <button
                                    type="button"
                                    aria-label="Decrease quantity"
                                    disabled={busy || item.quantity <= 1}
                                    onClick={() => run(item.id, () => updateItem(item.id, item.quantity - 1))}
                                >
                                    −
                                </button>
                                <span>{item.quantity}</span>
                                <button
                                    type="button"
                                    aria-label="Increase quantity"
                                    disabled={busy || (stock !== undefined && item.quantity >= stock)}
                                    onClick={() => run(item.id, () => updateItem(item.id, item.quantity + 1))}
                                >
                                    +
                                </button>
                            </div>

                            <p className="line-total">{formatMoney(item.lineTotal, cart.currency)}</p>

                            <button type="button" disabled={busy} onClick={() => run(item.id, () => removeItem(item.id))}>
                                Remove
                            </button>
                        </li>
                    );
                })}
            </ul>

            <div className="cart-summary">
                <p>
                    Subtotal: <strong>{formatMoney(cart.subtotal, cart.currency)}</strong>
                </p>
                <p className="muted">Preliminary total. Final prices and stock are confirmed at checkout.</p>
                <div className="form-actions">
                    <button type="button" onClick={handleClear} disabled={busyId !== null}>
                        Clear cart
                    </button>
                    <Link to="/checkout">Proceed to checkout</Link>
                </div>
            </div>
        </div>
    );
}