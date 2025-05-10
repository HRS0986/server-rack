'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { appwriteService } from '../utils/appwrite';

const AuthContext = createContext(undefined);

// List of routes that don't require authentication
const publicRoutes = ['/', '/login', '/register', '/forgot-password', '/reset-password', '/welcome', '/unauthorized'];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  
  const router = useRouter();
  const pathname = usePathname();

  // Check authentication status when component mounts
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        setAuthError(null);
        setIsLoading(true);
        
        const currentUser = await appwriteService.getCurrentUser();
        setUser(currentUser);
        
        // Redirect logic based on authentication status
        const isPublicRoute = publicRoutes.includes(pathname);
        
        if (!currentUser && !isPublicRoute) {
          // User is not logged in and trying to access a protected route
          router.push('/login');
        } else if (currentUser && isPublicRoute && pathname !== '/') {
          // User is logged in and trying to access a login/register page
          router.push('/');
        }
      } catch (error) {
        console.log('Auth status check failed:', error);
        setAuthError('Failed to verify authentication status');
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuthStatus();
  }, [pathname, router]);

  // Register a new user
  const register = async (email, password, name) => {
    try {
      setIsLoading(true);
      setAuthError(null);
      const userData = await appwriteService.createAccount(email, password, name);
      setUser(userData);
      router.push('/');
      return userData;
    } catch (error) {
      console.log('Registration error:', error);
      setAuthError(error.message || 'Registration failed. Please try again.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Log in an existing user
  const login = async (email, password) => {
    try {
      setIsLoading(true);
      setAuthError(null);
      const userData = await appwriteService.login(email, password);
      setUser(userData);
      router.push('/');
      return userData;
    } catch (error) {
      console.log('Login error:', error);
      setAuthError(error.message || 'Login failed. Please check your credentials.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Log out the current user
  const logout = async () => {
    try {
      setIsLoading(true);
      setAuthError(null);
      await appwriteService.logout();
      setUser(null);
      router.push('/login');
    } catch (error) {
      console.log('Logout error:', error);
      setAuthError(error.message || 'Logout failed. Please try again.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Request a password reset email
  const forgotPassword = async (email) => {
    try {
      setIsLoading(true);
      setAuthError(null);
      await appwriteService.forgotPassword(email);
      return true;
    } catch (error) {
      console.log('Forgot password error:', error);
      setAuthError(error.message || 'Failed to send reset instructions. Please try again.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Reset password with token
  const resetPassword = async (userId, secret, password, confirmPassword) => {
    try {
      setIsLoading(true);
      setAuthError(null);
      
      if (password !== confirmPassword) {
        throw new Error('Passwords do not match');
      }
      
      await appwriteService.resetPassword(userId, secret, password, confirmPassword);
      router.push('/login');
      return true;
    } catch (error) {
      console.log('Reset password error:', error);
      setAuthError(error.message || 'Failed to reset password. Please try again.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Update user profile
  const updateProfile = async (data) => {
    try {
      setIsLoading(true);
      setAuthError(null);
      
      if (data.name) {
        await appwriteService.updateName(data.name);
      }
      
      if (data.email && data.currentPassword) {
        await appwriteService.updateEmail(data.email, data.currentPassword);
      }
      
      if (data.newPassword && data.currentPassword) {
        await appwriteService.updatePassword(data.currentPassword, data.newPassword);
      }
      
      const updatedUser = await appwriteService.getCurrentUser();
      setUser(updatedUser);
      
      return updatedUser;
    } catch (error) {
      console.log('Profile update error:', error);
      setAuthError(error.message || 'Failed to update profile. Please try again.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Check if user has a specific role
  const hasRole = (role) => {
    if (!user) return false;
    return user.labels && user.labels.includes(role);
  };

  // Check if user is an admin
  const isAdmin = () => {
    return hasRole('admin');
  };

  // Values and functions to expose through the context
  const authContextValue = {
    user,
    isLoading,
    authError,
    register,
    login,
    logout,
    forgotPassword,
    resetPassword,
    updateProfile,
    hasRole,
    isAdmin,
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
