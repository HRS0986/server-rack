'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import Input from '../components/Input';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';

export default function ResetPasswordPage() {
  const { resetPassword, isLoading, authError } = useAuth();
  const searchParams = useSearchParams();
  
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [success, setSuccess] = useState(false);
  const [invalidLink, setInvalidLink] = useState(false);
  
  // Get userId and secret from URL
  const userId = searchParams.get('userId');
  const secret = searchParams.get('secret');
  
  useEffect(() => {
    if (!userId || !secret) {
      setInvalidLink(true);
    }
  }, [userId, secret]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear field error when typing
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
    
    // Clear submission error when form changes
    if (submitError) {
      setSubmitError('');
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }
    
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      try {
        await resetPassword(userId, secret, formData.password, formData.confirmPassword);
        setSuccess(true);
      } catch (error) {
        setSubmitError(error.message || 'Failed to reset password. Please try again.');
      }
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 bg-gray-900">
      <div className="w-full max-w-md bg-gray-800 p-8 rounded-lg shadow-lg border border-gray-700">
        <div className="text-center mb-6">
          <Link href="/" className="inline-block">
            <Image
              src="/image.png"
              alt="Server Rack Logo"
              width={48}
              height={48}
              className="mx-auto mb-2 invert"
            />
            <h1 className="text-2xl font-bold text-gray-100">Server Rack</h1>
          </Link>
          <h2 className="text-xl font-semibold mt-4 text-gray-200">Create New Password</h2>
        </div>
        
        {invalidLink ? (
          <div className="text-center py-4">
            <div className="bg-red-900/50 border border-red-800 text-red-100 px-4 py-3 rounded mb-4">
              Invalid or expired password reset link.
            </div>
            <Link href="/forgot-password">
              <Button className="mt-4">Request New Link</Button>
            </Link>
          </div>
        ) : success ? (
          <div className="text-center py-4">
            <div className="bg-green-900/50 border border-green-800 text-green-100 px-4 py-3 rounded mb-4">
              Password reset successful! You can now login with your new password.
            </div>
            <Link href="/login">
              <Button className="mt-4">Go to Login</Button>
            </Link>
          </div>
        ) : (
          <>
            {(submitError || authError) && (
              <div className="bg-red-900/50 border border-red-800 text-red-100 px-4 py-3 rounded mb-4">
                {submitError || authError}
              </div>
            )}
            
            <p className="text-gray-300 mb-4">
              Enter your new password below.
            </p>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="New Password"
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                error={formErrors.password}
                placeholder="••••••••"
                required
                autoComplete="new-password"
                disabled={isLoading}
              />
              
              <Input
                label="Confirm New Password"
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                error={formErrors.confirmPassword}
                placeholder="••••••••"
                required
                autoComplete="new-password"
                disabled={isLoading}
              />
              
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Resetting Password...' : 'Reset Password'}
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
