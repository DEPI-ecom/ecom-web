import { Link, NavLink, useNavigate, useSearchParams } from 'react-router-dom';
import SearchBar from './SearchBar';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
    const { user, isAuthenticated, logout } = useAuth();
    const { itemCount } = useCart();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    function handleSearch(q) {
        navigate(q ? `/products?q=${encodeURIComponent(q)}` : '/products');
    }

    function handleLogout() {
        logout();
        navigate('/');
    }

    return (
        <header className="navbar">
            <div className="container navbar-inner">
                <Link to="/" className="brand">
                    Marketly
                </Link>

                <SearchBar value={searchParams.get('q') ?? ''} onSearch={handleSearch} />

                <nav className="nav-links">
                    <NavLink to="/products">Products</NavLink>
                    {isAuthenticated ? (
                        <>
                            <NavLink to="/cart">Cart ({itemCount})</NavLink>
                            <NavLink to="/orders">Orders</NavLink>
                            <NavLink to="/profile">{user?.name ?? 'Profile'}</NavLink>
                            <button type="button" onClick={handleLogout}>
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <NavLink to="/login">Login</NavLink>
                            <NavLink to="/register">Register</NavLink>
                        </>
                    )}
                </nav>
            </div>
        </header>
    );
}