import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();
const API_BASE_URL = 'http://localhost:8000/api';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [csrfToken, setCsrfToken] = useState(null);

  // Fetch CSRF token
  const fetchCSRFToken = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/csrf-token/`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setCsrfToken(data.csrfToken);
        return data.csrfToken;
      }
    } catch (error) {
      console.error('Error fetching CSRF token:', error);
    }
    return null;
  };

  // Check authentication status on load
  useEffect(() => {
    fetchCSRFToken().then(() => {
      checkAuth();
    });
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      // Get CSRF token if we don't have it
      let token = csrfToken;
      if (!token) {
        token = await fetchCSRFToken();
      }

      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['X-CSRFToken'] = token;
      }

      const response = await fetch(`${API_BASE_URL}/auth/login/`, {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
        return { success: true };
      } else {
        // Handle different error formats
        let errorMessage = 'Login failed';
        if (data.non_field_errors && data.non_field_errors.length > 0) {
          errorMessage = data.non_field_errors[0];
        } else if (data.detail) {
          errorMessage = data.detail;
        } else if (data.email) {
          errorMessage = data.email[0];
        } else if (data.password) {
          errorMessage = data.password[0];
        } else if (typeof data === 'string') {
          errorMessage = data;
        }
        
        console.error('Login failed:', data);
        return { success: false, error: errorMessage };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Network error' };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      // Ensure we have a fresh CSRF token before posting
      let token = csrfToken;
      if (!token) {
        token = await fetchCSRFToken();
      }

      const headers = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['X-CSRFToken'] = token;
      }

      const response = await fetch(`${API_BASE_URL}/auth/register/`, {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({
          email: userData.email,
          username: userData.email.split('@')[0], // Use email prefix as username
          first_name: userData.firstName,
          last_name: userData.lastName,
          university: userData.university,
          password: userData.password,
          password_confirm: userData.password,
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
        return { success: true };
      } else {
        return { success: false, error: data.detail || Object.values(data)[0] || 'Registration failed' };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'Network error' };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      let token = csrfToken;
      if (!token) {
        token = await fetchCSRFToken();
      }

      const headers = {};
      if (token) {
        headers['X-CSRFToken'] = token;
      }

      await fetch(`${API_BASE_URL}/auth/logout/`, {
        method: 'POST',
        headers,
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('user');
      // Fetch new CSRF token after logout
      setCsrfToken(null);
      await fetchCSRFToken();
    }
  };

  const checkAuth = async () => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        // Verify the user is still valid with the backend
        const response = await fetch(`${API_BASE_URL}/auth/user/`, {
          credentials: 'include',
        });
        
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
        } else {
          // Token invalid, clear local storage
          localStorage.removeItem('user');
          setUser(null);
        }
      } catch (error) {
        // Network error, use stored user for now
        setUser(JSON.parse(storedUser));
      }
    }
  };

  const value = {
    user,
    login,
    register,
    logout,
    checkAuth,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};