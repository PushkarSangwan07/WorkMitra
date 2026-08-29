import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/auth.service';

const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // true while we check for an existing session

  // On first load, try to restore the session using the httpOnly refresh
  // cookie (works even after a hard browser refresh wipes React state).
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const accessToken = await authService.refresh();
        localStorage.setItem('accessToken', accessToken);
        const me = await authService.getMe();
        setUser(me);
      } catch (err) {
        localStorage.removeItem('accessToken');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = useCallback(async (email, password) => {
    const { user: loggedInUser, accessToken } = await authService.login({ email, password });
    localStorage.setItem('accessToken', accessToken);
    setUser(loggedInUser);
    return loggedInUser;
  }, []);

  const autoLogin = useCallback((loggedInUser, accessToken) => {
    // 1. Save the token exactly like the normal login does
    localStorage.setItem('accessToken', accessToken);
    
    // 2. Update the state with the user data
    setUser(loggedInUser);
    
    return loggedInUser;
  }, []);

  const register = useCallback(async (payload) => {
    const { user: newUser, accessToken } = await authService.register(payload);
    localStorage.setItem('accessToken', accessToken);
    setUser(newUser);
    return newUser;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      localStorage.removeItem('accessToken');
      setUser(null);
    }
  }, []);

  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    login,
    autoLogin,
    register,
    logout,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthContext;
