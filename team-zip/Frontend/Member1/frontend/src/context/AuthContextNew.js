import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiService } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('authToken'));

  // Register user
  const register = async (email, password, firstName, lastName, role = 'mentee') => {
    try {
      // Validate Addis Ababa University email - must end with @aau.edu.et
      if (!email.toLowerCase().endsWith('@aau.edu.et')) {
        throw new Error('Please use your Addis Ababa University email address ending with @aau.edu.et');
      }

      const response = await apiService.post('/auth/register', {
        email,
        password,
        firstName,
        lastName,
        role
      });

      const { token: newToken, user } = response.data;
      
      // Store token
      localStorage.setItem('authToken', newToken);
      setToken(newToken);
      setUserData(user);
      setCurrentUser({ uid: user.id, email: user.email });

      return { user: { uid: user.id, email: user.email } };
    } catch (error) {
      console.error('Registration error:', error);
      throw new Error(error.response?.data?.error || error.message);
    }
  };

  // Login user
  const login = async (email, password) => {
    try {
      // Validate Addis Ababa University email - must end with @aau.edu.et
      if (!email.toLowerCase().endsWith('@aau.edu.et')) {
        throw new Error('Please use your Addis Ababa University email address ending with @aau.edu.et');
      }

      const response = await apiService.post('/auth/login', {
        email,
        password
      });

      const { token: newToken, user } = response.data;
      
      // Store token
      localStorage.setItem('authToken', newToken);
      setToken(newToken);
      setUserData(user);
      setCurrentUser({ uid: user.id, email: user.email });

      return { user };
    } catch (error) {
      console.error('Login error:', error);
      throw new Error(error.response?.data?.error || error.message);
    }
  };

  // Logout user
  const logout = async () => {
    try {
      localStorage.removeItem('authToken');
      setToken(null);
      setUserData(null);
      setCurrentUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  // Get current user data from backend
  const fetchUserData = async () => {
    try {
      if (!token) return;

      const response = await apiService.get('/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      const user = response.data.user;
      setUserData(user);
      setCurrentUser({ uid: user.id, email: user.email });
    } catch (error) {
      console.error('Fetch user data error:', error);
      // If token is invalid, clear it
      if (error.response?.status === 403 || error.response?.status === 401) {
        localStorage.removeItem('authToken');
        setToken(null);
        setUserData(null);
        setCurrentUser(null);
      }
    }
  };

  // Get token for API requests (compatibility with Firebase version)
  const getIdToken = async () => {
    return token;
  };

  // Update user profile
  const updateProfile = async (profileData) => {
    try {
      if (!token) throw new Error('Not authenticated');

      const response = await apiService.put('/auth/profile', profileData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const user = response.data.user;
      setUserData(user);
      return user;
    } catch (error) {
      console.error('Update profile error:', error);
      throw new Error(error.response?.data?.error || error.message);
    }
  };

  // Change password
  const changePassword = async (currentPassword, newPassword) => {
    try {
      if (!token) throw new Error('Not authenticated');

      await apiService.put('/auth/password', {
        currentPassword,
        newPassword
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
    } catch (error) {
      console.error('Change password error:', error);
      throw new Error(error.response?.data?.error || error.message);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        await fetchUserData();
      }
      setLoading(false);
    };

    initAuth();
  }, [token]);

  const value = {
    currentUser,
    userData,
    register,
    login,
    logout,
    getIdToken,
    fetchUserData,
    updateProfile,
    changePassword,
    token
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};