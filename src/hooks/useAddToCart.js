import { useCallback, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { getErrorMessage } from '../utils/errors';

// Shared by ProductCard and ProductDetails. Sends guests to /login and back.
export default function useAddToCart() {
    const { isAuthenticated } = useAuth();
    const { addItem } = useCart();
    const navigate = useNavigate();
    const location = useLocation();
    const [state, setState] = useState({ busy: false, message: '', isError: false });

    const add = useCallback(
        async (productId, quantity = 1) => {
            if (!isAuthenticated) {
                navigate('/login', { state: { from: location } });
                return false;
            }
            setState({ busy: true, message: '', isError: false });
            try {
                await addItem(productId, quantity);
                setState({ busy: false, message: 'Added to cart.', isError: false });
                return true;
            } catch (err) {
                setState({ busy: false, message: getErrorMessage(err), isError: true });
                return false;
            }
        },
        [isAuthenticated, addItem, navigate, location]
    );

    return { ...state, add };
}