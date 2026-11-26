import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import StatusMessage, { ErrorMessage } from '../components/StatusMessage';
import useAddToCart from '../hooks/useAddToCart';
import useAsync from '../hooks/useAsync';
import { getProduct } from '../services/product.service';
import { formatMoney } from '../utils/format';

export default function ProductDetails() {
    const { productId } = useParams();
    const { data: product, loading, error } = useAsync(() => getProduct(productId), [productId]);
    const { add, busy, message, isError } = useAddToCart();
    const [quantity, setQuantity] = useState(1);

    if (loading) return <div className="container"><StatusMessage>Loading…</StatusMessage></div>;
    if (error) {
        return (
            <div className="container">
                <ErrorMessage error={error} fallback="Could not load this product." />
                <Link to="/products">Back to products</Link>
            </div>
        );
    }
    if (!product) return null;

    const outOfStock = product.stock <= 0;

    function handleQuantityChange(event) {
        const value = Number(event.target.value);
        if (!Number.isInteger(value)) return;
        setQuantity(Math.min(Math.max(value, 1), Math.max(product.stock, 1)));
    }

    return (
        <div className="container">
            <p>
                <Link to="/products">← Back to products</Link>
            </p>

            <div className="product-details">
                {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} />
                ) : (
                    <div className="image-placeholder large">No image</div>
                )}

                <div>
                    <h1>{product.name}</h1>
                    {product.category && (
                        <p className="muted">
                            <Link to={`/products?categoryId=${product.category.id}`}>{product.category.name}</Link>
                        </p>
                    )}
                    <p className="price">{formatMoney(product.price)}</p>
                    <p>{product.description}</p>
                    <p className="muted">{outOfStock ? 'Out of stock' : `${product.stock} in stock`}</p>

                    {!outOfStock && (
                        <div className="form-actions">
                            <label>
                                Quantity
                                <input type="number" min="1" max={product.stock} value={quantity} onChange={handleQuantityChange} />
                            </label>
                            <button type="button" disabled={busy} onClick={() => add(product.id, quantity)}>
                                {busy ? 'Adding…' : 'Add to cart'}
                            </button>
                        </div>
                    )}

                    {message && (
                        <p role={isError ? 'alert' : 'status'} className={isError ? 'text-error' : 'text-success'}>
                            {message} {!isError && <Link to="/cart">View cart</Link>}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}