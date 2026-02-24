import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import { toast } from 'react-hot-toast';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [role, setRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMe = useCallback(async () => {
    try {
      const response = await api.get('/auth/me');
      setUser(response.data.user);
      setProfile(response.data.profile);
      setRole(response.data.user.role);
    } catch (error) {
      console.error('Error fetching user data:', error);
      setUser(null);
      setProfile(null);
      setRole(null);
      localStorage.removeItem('token');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchMe();
    } else {
      setIsLoading(false);
    }
  }, [fetchMe]);

  const signIn = useCallback(async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user: userData } = response.data;

      localStorage.setItem('token', token);
      setUser(userData);
      setRole(userData.role);

      await fetchMe();

      toast.success('Signed in successfully!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to sign in';
      toast.error(message);
      return { error: message };
    }
  }, [fetchMe]);

  const masterSignIn = useCallback(async (email, password) => {
    try {
      const response = await api.post('/auth/master-login', { email, password });

      const { token, user: userData } = response.data;

      localStorage.setItem('token', token);
      setUser(userData);
      setRole(userData.role);

      await fetchMe();

      toast.success('Master Admin signed in successfully!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Invalid Master Admin credentials';
      toast.error(message);
      return { error: message };
    }
  }, [fetchMe]);

  const createUser = useCallback(async (userData) => {
    try {
      const response = await api.post('/auth/create-user', userData);
      toast.success('User created successfully!');
      return { success: true, data: response.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create user';
      toast.error(message);
      return { error: message };
    }
  }, []);

  const signOut = useCallback(() => {
    localStorage.removeItem('token');
    setUser(null);
    setProfile(null);
    setRole(null);
    toast.success('Signed out successfully');
  }, []);

  const updateAvatar = useCallback(async (file) => {
    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await api.post('/profile/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setProfile(prev => ({ ...prev, avatar_url: response.data.avatar_url }));
      toast.success('Profile picture updated!');
      return { success: true, avatar_url: response.data.avatar_url };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update avatar';
      toast.error(message);
      return { error: message };
    }
  }, []);

  const signUp = useCallback(async (formData) => {
    try {
      const response = await api.post('/auth/register', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      toast.success('Registration successful!');
      return { success: true, data: response.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to register';
      toast.error(message);
      return { error: message };
    }
  }, []);

  const registerMasterAdmin = useCallback(async (formData) => {
    try {
      console.log('Sending Master Admin registration request...');
      // Log FormData contents
      for (let pair of formData.entries()) {
        console.log(pair[0] + ': ' + (pair[1] instanceof File ? 'File - ' + pair[1].name : pair[1]));
      }

      const response = await api.post('/auth/register-master-admin', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const { token, user: userData, profile: profileData } = response.data;
      localStorage.setItem('token', token);
      setUser(userData);
      setProfile(profileData);
      setRole(userData.role);

      toast.success('Master Admin registered successfully!');
      return { success: true };
    } catch (error) {
      console.error('Master Admin registration error:', error);
      const message = error.response?.data?.message || 'Failed to register Master Admin';
      toast.error(message);
      return { error: message };
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        role,
        isAuthenticated: !!user,
        isLoading,
        signIn,
        masterSignIn,
        createUser,
        signUp,
        registerMasterAdmin,
        updateAvatar,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
