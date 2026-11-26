import api, { cleanParams, unwrap } from './api';

// Returns { products, pagination }
export async function listProducts(params = {}) {
    const res = await api.get('/products', { params: cleanParams(params), skipAuth: true });
    return unwrap(res);
}

// Search forwards to Catalog, so the response shape is identical to listProducts.
export async function searchProducts(params = {}) {
    const res = await api.get('/search', { params: cleanParams(params), skipAuth: true });
    return unwrap(res);
}

export async function getProduct(productId) {
    const res = await api.get(`/products/${productId}`, { skipAuth: true });
    return unwrap(res, 'product');
}

export async function listCategories() {
    const res = await api.get('/categories', { skipAuth: true });
    const data = unwrap(res, 'categories');
    return Array.isArray(data) ? data : [];
}