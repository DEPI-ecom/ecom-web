import { useState } from 'react';
import { ErrorMessage } from './StatusMessage';

const EMPTY = {
    label: '',
    recipientName: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    isDefault: false,
};

// onSubmit(payload) may throw; the error is shown inside the form.
export default function AddressForm({ initialValues, onSubmit, onCancel, submitLabel = 'Save address' }) {
    const [values, setValues] = useState({ ...EMPTY, ...initialValues });
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState(null);

    function handleChange(event) {
        const { name, value, type, checked } = event.target;
        setValues((v) => ({ ...v, [name]: type === 'checkbox' ? checked : value }));
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setBusy(true);
        setError(null);

        // state and postalCode are optional in the backend model, so omit them when empty.
        const payload = {
            label: values.label.trim(),
            recipientName: values.recipientName.trim(),
            phone: values.phone.trim(),
            street: values.street.trim(),
            city: values.city.trim(),
            isDefault: values.isDefault,
        };
        if (values.state?.trim()) payload.state = values.state.trim();
        if (values.postalCode?.trim()) payload.postalCode = values.postalCode.trim();

        try {
            await onSubmit(payload);
        } catch (err) {
            setError(err);
        } finally {
            setBusy(false);
        }
    }

    return (
        <form className="form" onSubmit={handleSubmit}>
            <label>
                Label (e.g. Home)
                <input name="label" value={values.label} onChange={handleChange} required />
            </label>
            <label>
                Recipient name
                <input name="recipientName" value={values.recipientName} onChange={handleChange} required />
            </label>
            <label>
                Phone
                <input name="phone" value={values.phone} onChange={handleChange} required />
            </label>
            <label>
                Street
                <input name="street" value={values.street} onChange={handleChange} required />
            </label>
            <label>
                City
                <input name="city" value={values.city} onChange={handleChange} required />
            </label>
            <label>
                State / governorate (optional)
                <input name="state" value={values.state ?? ''} onChange={handleChange} />
            </label>
            <label>
                Postal code (optional)
                <input name="postalCode" value={values.postalCode ?? ''} onChange={handleChange} />
            </label>
            <label className="checkbox">
                <input type="checkbox" name="isDefault" checked={values.isDefault} onChange={handleChange} />
                Set as default address
            </label>

            <ErrorMessage error={error} />

            <div className="form-actions">
                <button type="submit" disabled={busy}>
                    {busy ? 'Saving…' : submitLabel}
                </button>
                {onCancel && (
                    <button type="button" onClick={onCancel} disabled={busy}>
                        Cancel
                    </button>
                )}
            </div>
        </form>
    );
}