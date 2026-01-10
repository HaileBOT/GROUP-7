import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth } from '../config/firebase';
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

  // Register user
  const register = async (email, password, firstName, lastName, role = 'mentee') => {
    try {
      // Validate Addis Ababa University email - must end with @aau.edu.et
      if (!email.toLowerCase().endsWith('@aau.edu.et')) {
        throw new Error('Please use your Addis Ababa University email address ending with @aau.edu.et');
      }

      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Get ID token
      const idToken = await userCredential.user.getIdToken();
      
      // Register user in backend
      await apiService.post('/auth/register', {
        email,
        password,
        firstName,
        lastName,
        role
      }, {
        headers: {
          Authorization: `Bearer ${idToken}`
        }
      });

      return userCredential;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  // Login user
  const login = async (email, password) => {
    try {
      // Validate Addis Ababa University email - must end with @aau.edu.et
      if (!email.toLowerCase().endsWith('@aau.edu.et')) {
        throw new Error('Please use your Addis Ababa University email address ending with @aau.edu.et');
      }

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  // Logout user
  const logout = async () => {
    try {
      await signOut(auth);
      setUserData(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  // Get current user data from backend
  const fetchUserData = async (user) => {
    try {
      const idToken = await user.getIdToken();
      const response = await apiService.get('/auth/me', {
        headers: {
          Authorization: `Bearer ${idToken}`
        }
      });
      setUserData(response.data);
    } catch (error) {
      console.error('Fetch user data error:', error);
      setUserData(null);
    }
  };

  // Get ID token for API requests
  const getIdToken = async () => {
    if (currentUser) {
      return await currentUser.getIdToken();
    }
    return null;
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        await fetchUserData(user);
      } else {
        setUserData(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userData,
    register,
    login,
    logout,
    getIdToken,
    fetchUserData
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};