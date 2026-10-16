import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

// This shared container lets any component read login information without passing it through every level.
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  // When the app first opens, check whether the saved login token is still accepted by the backend.
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      authAPI.getMe()
        .then(res => {
          setUser(res.data);
          localStorage.setItem('user', JSON.stringify(res.data));
        })
        .catch((err) => {
          if (err.response?.status === 401) {
            localStorage.removeItem('access_token');
            localStorage.removeItem('user');
            setUser(null);
          }
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  // Exchange Google's temporary token for this application's login token and user details.
  const login = async (googleToken) => {
    const res = await authAPI.googleLogin(googleToken);
    const { access_token, user } = res.data;
    localStorage.setItem('access_token', access_token);
    localStorage.setItem('user', JSON.stringify(user));
    setUser(user);
    return user;
  };

  // Remove saved login details so protected pages become inaccessible.
  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
