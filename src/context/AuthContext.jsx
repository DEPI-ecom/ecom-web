import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as authService from '../services/auth.service';
import * as userService from '../services/user.service';
import { setUnauthorizedHandler } from '../services/api';
import { clearToken, getToken, setToken } from '../utils/token';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    // True while we validate a stored token on first load.
    const [initializing, setInitializing] = useState(() => Boolean(getToken()));

    const logout = useCallback(() => {
        clearToken();
        setUser(null);
    }, []);

    // Let the Axios interceptor log us out on 401.
    useEffect(() => {
        setUnauthorizedHandler(logout);
    }, [logout]);

    // Restore session from a stored token.
    useEffect(() => {
        if (!getToken()) return undefined;
        let cancelled = false;
        userService
            .getProfile()
            .then((profile) => {
                if (!cancelled) setUser(profile);
            })
            .catch(() => {
                if (!cancelled) logout();
            })
            .finally(() => {
                if (!cancelled) setInitializing(false);
            });
        return () => {
            cancelled = true;
        };
    }, [logout]);

    const login = useCallback(async (credentials) => {
        const { user: loggedInUser, token } = await authService.login(credentials);
        setToken(token);
        setUser(loggedInUser);
    }, []);

    const register = useCallback(async (details) => {
        const { user: newUser, token } = await authService.register(details);
        setToken(token);
        setUser(newUser);
    }, []);

    const value = useMemo(
        () => ({
            user,
            isAuthenticated: Boolean(user),
            initializing,
            login,
            register,
            logout,
            updateUser: setUser,
        }),
        [user, initializing, login, register, logout]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used inside <AuthProvider>');
    return context;
}