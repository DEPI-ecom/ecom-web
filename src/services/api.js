import axios from 'axios';
import { getToken } from '../utils/token';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
    timeout: 10000,
    headers: { 'Content-Type': 'application/json' },
});

// AuthContext registers a callback so an expired/invalid token logs the user out.
let unauthorizedHandler = null;
export const setUnauthorizedHandler = (fn) => {
    unauthorizedHandler = fn;
};

// Attach the JWT unless the request opts out (public endpoints pass { skipAuth: true }).
api.interceptors.request.use((config) => {
    const token = getToken();
    if (token && !config.skipAuth) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const sentToken = Boolean(error.config?.headers?.Authorization);
        if (error.response?.status === 401 && sentToken && unauthorizedHandler) {
            unauthorizedHandler();
        }
        return Promise.reject(error);
    }
);

// Services wrap payloads as { data: ... }. If `key` is given and present, return data[key],
// otherwise data itself. Tolerates both `data.user` and bare `data` shapes.
export function unwrap(response, key) {
    const data = response.data?.data;
    if (key && data && typeof data === 'object' && data[key] !== undefined) return data[key];
    return data;
}

// Drop empty query params so we never send ?q=&minPrice=
export function cleanParams(params = {}) {
    return Object.fromEntries(
        Object.entries(params).filter(([, v]) => v !== '' && v !== null && v !== undefined)
    );
}

export default api;