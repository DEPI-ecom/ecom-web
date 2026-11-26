import api, { unwrap } from './api';

export async function getProfile() {
    return unwrap(await api.get('/users/me'), 'user');
}

export async function updateProfile(values) {
    return unwrap(await api.put('/users/me', values), 'user');
}

export async function listAddresses() {
    const data = unwrap(await api.get('/users/me/addresses'), 'addresses');
    return Array.isArray(data) ? data : [];
}

export async function createAddress(values) {
    return unwrap(await api.post('/users/me/addresses', values), 'address');
}

export async function updateAddress(addressId, values) {
    return unwrap(await api.put(`/users/me/addresses/${addressId}`, values), 'address');
}

// Don't rely on the response body/status; callers should reload the list afterwards.
export async function deleteAddress(addressId) {
    await api.delete(`/users/me/addresses/${addressId}`);
}