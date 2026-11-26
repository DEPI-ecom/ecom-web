import { useState } from 'react';
import AddressForm from '../components/AddressForm';
import StatusMessage, { ErrorMessage } from '../components/StatusMessage';
import { useAuth } from '../context/AuthContext';
import useAsync from '../hooks/useAsync';
import {
    createAddress,
    deleteAddress,
    listAddresses,
    updateAddress,
    updateProfile,
} from '../services/user.service';
import { getErrorMessage } from '../utils/errors';

export default function Profile() {
    const { user, updateUser } = useAuth();

    const [form, setForm] = useState({ name: user?.name ?? '', phone: user?.phone ?? '' });
    const [saving, setSaving] = useState(false);
    const [profileError, setProfileError] = useState(null);
    const [profileSaved, setProfileSaved] = useState(false);

    const addressesState = useAsync(listAddresses, []);
    const addresses = addressesState.data ?? [];
    const [editing, setEditing] = useState(null); // null | 'new' | address object
    const [addressError, setAddressError] = useState('');

    async function handleProfileSubmit(event) {
        event.preventDefault();
        setSaving(true);
        setProfileError(null);
        setProfileSaved(false);
        try {
            const updated = await updateProfile({ name: form.name.trim(), phone: form.phone.trim() });
            updateUser((current) => ({ ...current, ...updated }));
            setProfileSaved(true);
        } catch (err) {
            setProfileError(err);
        } finally {
            setSaving(false);
        }
    }

    async function handleAddressSave(values) {
        if (editing === 'new') await createAddress(values);
        else await updateAddress(editing.id, values);
        setEditing(null);
        await addressesState.reload();
    }

    async function handleAddressDelete(addressId) {
        if (!window.confirm('Delete this address?')) return;
        setAddressError('');
        try {
            await deleteAddress(addressId);
            await addressesState.reload();
        } catch (err) {
            setAddressError(getErrorMessage(err));
        }
    }

    return (
        <div className="container narrow">
            <h1>Your profile</h1>

            <section>
                <h2>Account</h2>
                <form className="form" onSubmit={handleProfileSubmit}>
                    <label>
                        Email
                        <input value={user?.email ?? ''} disabled readOnly />
                    </label>
                    <label>
                        Name
                        <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
                    </label>
                    <label>
                        Phone
                        <input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} required />
                    </label>
                    <ErrorMessage error={profileError} />
                    {profileSaved && <StatusMessage type="success">Profile updated.</StatusMessage>}
                    <button type="submit" disabled={saving}>
                        {saving ? 'Saving…' : 'Save changes'}
                    </button>
                </form>
            </section>

            <section>
                <h2>Saved addresses</h2>
                {addressesState.loading && <p>Loading addresses…</p>}
                <ErrorMessage error={addressesState.error} fallback="Could not load your addresses." />
                {addressError && <StatusMessage type="error">{addressError}</StatusMessage>}

                {!addressesState.loading && !addressesState.error && addresses.length === 0 && editing === null && (
                    <StatusMessage>You have no saved addresses yet.</StatusMessage>
                )}

                <ul className="address-list">
                    {addresses.map((address) => (
                        <li key={address.id}>
                            {editing?.id === address.id ? (
                                <AddressForm
                                    initialValues={address}
                                    submitLabel="Update address"
                                    onSubmit={handleAddressSave}
                                    onCancel={() => setEditing(null)}
                                />
                            ) : (
                                <>
                                    <p>
                                        <strong>{address.label}</strong>
                                        {address.isDefault && ' (default)'}
                                    </p>
                                    <p>
                                        {address.recipientName}, {address.phone}
                                    </p>
                                    <p>
                                        {address.street}, {address.city}
                                        {address.state ? `, ${address.state}` : ''}
                                        {address.postalCode ? ` ${address.postalCode}` : ''}
                                    </p>
                                    <div className="form-actions">
                                        <button type="button" onClick={() => setEditing(address)}>
                                            Edit
                                        </button>
                                        <button type="button" onClick={() => handleAddressDelete(address.id)}>
                                            Delete
                                        </button>
                                    </div>
                                </>
                            )}
                        </li>
                    ))}
                </ul>

                {editing === 'new' ? (
                    <AddressForm onSubmit={handleAddressSave} onCancel={() => setEditing(null)} submitLabel="Add address" />
                ) : (
                    <button type="button" onClick={() => setEditing('new')}>
                        Add address
                    </button>
                )}
            </section>
        </div>
    );
}