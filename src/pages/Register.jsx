import { useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import StatusMessage, { ErrorMessage } from '../components/StatusMessage';
import { useAuth } from '../context/AuthContext';

export default function Register() {
    const { register, isAuthenticated } = useAuth();
    const location = useLocation();
    const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
    const [error, setError] = useState(null);
    const [localError, setLocalError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const from = location.state?.from;
    const redirectTo = from ? `${from.pathname}${from.search ?? ''}` : '/';

    if (isAuthenticated) return <Navigate to={redirectTo} replace />;

    function handleChange(event) {
        setForm((f) => ({ ...f, [event.target.name]: event.target.value }));
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setError(null);
        setLocalError('');

        if (form.password !== form.confirmPassword) {
            setLocalError('Passwords do not match.');
            return;
        }

        setSubmitting(true);
        try {
            const { name, email, phone, password } = form;
            await register({ name, email, phone, password });
        } catch (err) {
            setError(err);
            setSubmitting(false);
        }
    }

    return (
        <div className="container narrow">
            <h1>Create an account</h1>
            <form className="form" onSubmit={handleSubmit}>
                <label>
                    Name
                    <input name="name" value={form.name} onChange={handleChange} required autoComplete="name" />
                </label>
                <label>
                    Email
                    <input type="email" name="email" value={form.email} onChange={handleChange} required autoComplete="email" />
                </label>
                <label>
                    Phone
                    <input type="tel" name="phone" value={form.phone} onChange={handleChange} required autoComplete="tel" />
                </label>
                <label>
                    Password
                    <input
                        type="password"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        required
                        autoComplete="new-password"
                    />
                </label>
                <label>
                    Confirm password
                    <input
                        type="password"
                        name="confirmPassword"
                        value={form.confirmPassword}
                        onChange={handleChange}
                        required
                        autoComplete="new-password"
                    />
                </label>
                {localError && <StatusMessage type="error">{localError}</StatusMessage>}
                <ErrorMessage error={error} />
                <button type="submit" disabled={submitting}>
                    {submitting ? 'Creating account…' : 'Register'}
                </button>
            </form>
            <p>
                Already registered? <Link to="/login">Log in</Link>
            </p>
        </div>
    );
}