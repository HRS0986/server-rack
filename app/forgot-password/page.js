'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '../context/AuthContext';
import Input from '../components/Input';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';

export default function ForgotPasswordPage() {
  const { forgotPassword, isLoading, authError } = useAuth();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setEmailError('');
    setSubmitError('');
  };

  const validateForm = () => {
    if (!email) {
      setEmailError('Email is required');
      return false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Email is invalid');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      try {
        await forgotPassword(email);
        setSuccess(true);
      } catch (error) {
        setSubmitError(error.message || 'Failed to send recovery email. Please try again.');
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
              src="/file.svg"
              alt="Server Rack Logo"
              width={48}
              height={48}
              className="mx-auto mb-2 invert"
            />
            <h1 className="text-2xl font-bold text-gray-100">Server Rack</h1>
          </Link>
          <h2 className="text-xl font-semibold mt-4 text-gray-200">Reset Password</h2>
        </div>
        
        {success ? (
          <div className="text-center py-4">
            <div className="bg-green-900/50 border border-green-800 text-green-100 px-4 py-3 rounded mb-4">
              Password reset email sent! Check your inbox for instructions.
            </div>
            <Link href="/login">
              <Button className="mt-4">Back to Login</Button>
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
              Enter your email address and we'll send you a link to reset your password.
            </p>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email"
                id="email"
                type="email"
                value={email}
                onChange={handleEmailChange}
                error={emailError}
                placeholder="you@example.com"
                required
                autoComplete="email"
                disabled={isLoading}
              />
              
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Sending...' : 'Send Reset Link'}
              </Button>
            </form>
            
            <div className="mt-6 text-center text-gray-400">
              <p>
                Remember your password?{' '}
                <Link href="/login" className="text-blue-400 hover:text-blue-300">
                  Sign in
                </Link>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
