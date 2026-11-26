import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import StatusMessage, { ErrorMessage } from '../components/StatusMessage';
import useAsync from '../hooks/useAsync';
import { listCategories, listProducts } from '../services/product.service';

export default function Home() {
    const { data, loading, error } = useAsync(async () => {
        const [productData, categories] = await Promise.all([
            listProducts({ limit: 8, sort: 'newest' }),
            listCategories().catch(() => []),
        ]);
        return { products: productData.products ?? [], categories };
    }, []);

    return (
        <div className="container">
            <section className="hero">
                <h1>Welcome to Marketly</h1>
                <p>Browse our catalog and check out with a simulated payment.</p>
                <Link to="/products">Shop all products</Link>
            </section>

            {loading && <StatusMessage>Loading…</StatusMessage>}
            <ErrorMessage error={error} />

            {data && (
                <>
                    {data.categories.length > 0 && (
                        <section>
                            <h2>Categories</h2>
                            <ul className="chip-list">
                                {data.categories.map((category) => (
                                    <li key={category.id}>
                                        <Link to={`/products?categoryId=${category.id}`}>{category.name}</Link>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}

                    <section>
                        <h2>New arrivals</h2>
                        {data.products.length === 0 ? (
                            <StatusMessage>No products available yet.</StatusMessage>
                        ) : (
                            <div className="product-grid">
                                {data.products.map((product) => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>
                        )}
                    </section>
                </>
            )}
        </div>
    );
}