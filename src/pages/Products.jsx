import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Pagination from '../components/Pagination';
import ProductCard from '../components/ProductCard';
import StatusMessage, { ErrorMessage } from '../components/StatusMessage';
import useAsync from '../hooks/useAsync';
import { listCategories, listProducts, searchProducts } from '../services/product.service';

const PAGE_SIZE = 12;
const SORT_OPTIONS = [
    { value: 'newest', label: 'Newest' },
    { value: 'price_asc', label: 'Price: low to high' },
    { value: 'price_desc', label: 'Price: high to low' },
    { value: 'name', label: 'Name' },
];

export default function Products() {
    // The URL is the single source of truth for filters, so pages are linkable/back-button friendly.
    const [searchParams, setSearchParams] = useSearchParams();
    const q = searchParams.get('q') ?? '';
    const categoryId = searchParams.get('categoryId') ?? '';
    const minPrice = searchParams.get('minPrice') ?? '';
    const maxPrice = searchParams.get('maxPrice') ?? '';
    const sort = searchParams.get('sort') || 'newest';
    const page = Number(searchParams.get('page')) || 1;

    const [priceInputs, setPriceInputs] = useState({ min: minPrice, max: maxPrice });
    const [priceError, setPriceError] = useState('');

    useEffect(() => {
        setPriceInputs({ min: minPrice, max: maxPrice });
    }, [minPrice, maxPrice]);

    const categoriesState = useAsync(listCategories, []);

    // Use the Search service when there is a keyword; otherwise browse via Catalog. Same response shape.
    const { data, loading, error } = useAsync(() => {
        const params = { q, categoryId, minPrice, maxPrice, sort, page, limit: PAGE_SIZE };
        return q ? searchProducts(params) : listProducts(params);
    }, [q, categoryId, minPrice, maxPrice, sort, page]);

    function updateParams(changes) {
        const next = new URLSearchParams(searchParams);
        Object.entries(changes).forEach(([key, value]) => {
            if (value === '' || value === null || value === undefined) next.delete(key);
            else next.set(key, value);
        });
        if (!('page' in changes)) next.delete('page'); // any filter change goes back to page 1
        setSearchParams(next);
    }

    function handlePriceSubmit(event) {
        event.preventDefault();
        const { min, max } = priceInputs;
        // Input validation only (not money arithmetic); the backend validates again.
        if ((min !== '' && Number(min) < 0) || (max !== '' && Number(max) < 0)) {
            setPriceError('Prices cannot be negative.');
            return;
        }
        if (min !== '' && max !== '' && Number(min) > Number(max)) {
            setPriceError('Minimum price cannot exceed maximum price.');
            return;
        }
        setPriceError('');
        updateParams({ minPrice: min, maxPrice: max });
    }

    const products = data?.products ?? [];
    const pagination = data?.pagination;
    const categories = categoriesState.data ?? [];
    const hasFilters = Boolean(q || categoryId || minPrice || maxPrice);

    return (
        <div className="container layout-sidebar">
            <aside className="filters">
                <h2>Filters</h2>

                <h3>Category</h3>
                <ul className="plain-list">
                    <li>
                        <button type="button" className={!categoryId ? 'active' : ''} onClick={() => updateParams({ categoryId: '' })}>
                            All
                        </button>
                    </li>
                    {categories.map((category) => {
                        const count = category.productCount ?? category._count?.products;
                        return (
                            <li key={category.id}>
                                <button
                                    type="button"
                                    className={categoryId === category.id ? 'active' : ''}
                                    onClick={() => updateParams({ categoryId: category.id })}
                                >
                                    {category.name}
                                    {count !== undefined ? ` (${count})` : ''}
                                </button>
                            </li>
                        );
                    })}
                </ul>

                <h3>Price</h3>
                <form className="form" onSubmit={handlePriceSubmit}>
                    <label>
                        Min
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={priceInputs.min}
                            onChange={(e) => setPriceInputs((p) => ({ ...p, min: e.target.value }))}
                        />
                    </label>
                    <label>
                        Max
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={priceInputs.max}
                            onChange={(e) => setPriceInputs((p) => ({ ...p, max: e.target.value }))}
                        />
                    </label>
                    {priceError && <p className="text-error">{priceError}</p>}
                    <button type="submit">Apply</button>
                </form>

                {hasFilters && (
                    <button type="button" onClick={() => setSearchParams({})}>
                        Clear all filters
                    </button>
                )}
            </aside>

            <section className="results">
                <div className="results-header">
                    <h1>{q ? `Results for “${q}”` : 'Products'}</h1>
                    <label>
                        Sort by{' '}
                        <select value={sort} onChange={(e) => updateParams({ sort: e.target.value })}>
                            {SORT_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </label>
                </div>

                {loading && <StatusMessage>Loading products…</StatusMessage>}
                <ErrorMessage error={error} />

                {!loading && !error && products.length === 0 && <StatusMessage>No products match your search.</StatusMessage>}

                {products.length > 0 && (
                    <>
                        {pagination && <p className="muted">{pagination.total} product(s)</p>}
                        <div className="product-grid">
                            {products.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                        <Pagination
                            page={pagination?.page ?? page}
                            totalPages={pagination?.totalPages}
                            onChange={(nextPage) => updateParams({ page: String(nextPage) })}
                        />
                    </>
                )}
            </section>
        </div>
    );
}