'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

/**
 * Component to protect routes based on role
 * @param {Object} props
 * @param {string} props.requiredRole - The role required to access the route (e.g., 'admin')
 * @param {React.ReactNode} props.children - The content to render if authorized
 * @param {string} props.redirectTo - Where to redirect if unauthorized (default: '/unauthorized')
 */
export default function RoleGuard({ 
  requiredRole, 
  children, 
  redirectTo = '/unauthorized' 
}) {
  const { user, isLoading, hasRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Wait until auth is checked
    if (!isLoading) {
      // If no user or user doesn't have the required role, redirect
      if (!user || !hasRole(requiredRole)) {
        router.push(redirectTo);
      }
    }
  }, [user, isLoading, hasRole, requiredRole, router, redirectTo]);

  // Show loading while checking auth
  if (isLoading || (!user || !hasRole(requiredRole))) {
    return <LoadingSpinner />;
  }

  // User has the required role, render children
  return children;
}
