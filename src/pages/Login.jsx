import { useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { ErrorMessage } from '../components/StatusMessage';
import { useAuth } from '../context/AuthContext';

export default function Login() {
    const { login, isAuthenticated } = useAuth();
    const location = useLocation();
    const [form, setForm] = useState({ email: '', password: '' });
    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    // ProtectedRoute / add-to-cart send us here with the page the user came from.
    const from = location.state?.from;
    const redirectTo = from ? `${from.pathname}${from.search ?? ''}` : '/';

    if (isAuthenticated) return <Navigate to={redirectTo} replace />;

    function handleChange(event) {
        setForm((f) => ({ ...f, [event.target.name]: event.target.value }));
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setSubmitting(true);
        setError(null);
        try {
            await login(form); // success flips isAuthenticated, which redirects above
        } catch (err) {
            setError(err);
            setSubmitting(false);
        }
    }

    return (
        <div className="container narrow">
            <h1>Log in</h1>
            <form className="form" onSubmit={handleSubmit}>
                <label>
                    Email
                    <input type="email" name="email" value={form.email} onChange={handleChange} required autoComplete="email" />
                </label>
                <label>
                    Password
                    <input
                        type="password"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        required
                        autoComplete="current-password"
                    />
                </label>
                <ErrorMessage error={error} />
                <button type="submit" disabled={submitting}>
                    {submitting ? 'Logging in…' : 'Log in'}
                </button>
            </form>
            <p>
                No account? <Link to="/register">Register</Link>
            </p>
        </div>
    );
}