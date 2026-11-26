import api, { unwrap } from './api';

// Both return { user, token }
export async function register({ name, email, phone, password }) {
    const res = await api.post(
        '/auth/register',
        { name: name.trim(), email: email.trim().toLowerCase(), phone: phone.trim(), password },
        { skipAuth: true }
    );
    return unwrap(res);
}

export async function login({ email, password }) {
    const res = await api.post(
        '/auth/login',
        { email: email.trim().toLowerCase(), password },
        { skipAuth: true }
    );
    return unwrap(res);
}