import { Link } from 'react-router-dom';
import useAddToCart from '../hooks/useAddToCart';
import { formatMoney } from '../utils/format';

export default function ProductCard({ product }) {
    const { add, busy, message, isError } = useAddToCart();
    const outOfStock = product.stock <= 0;

    return (
        <article className="product-card">
            <Link to={`/products/${product.id}`}>
                {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} loading="lazy" />
                ) : (
                    <div className="image-placeholder">No image</div>
                )}
                <h3>{product.name}</h3>
            </Link>

            {product.category && <p className="muted">{product.category.name}</p>}
            <p className="price">{formatMoney(product.price)}</p>
            <p className="muted">{outOfStock ? 'Out of stock' : `${product.stock} in stock`}</p>

            <button type="button" disabled={busy || outOfStock} onClick={() => add(product.id, 1)}>
                {busy ? 'Adding…' : 'Add to cart'}
            </button>
            {message && (
                <p role={isError ? 'alert' : 'status'} className={isError ? 'text-error' : 'text-success'}>
                    {message}
                </p>
            )}
        </article>
    );
}