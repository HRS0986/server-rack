'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Input from '../components/Input';
import Button from '../components/Button';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';

export default function ProfilePage() {
  const { user, updateProfile, isLoading, authError } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  
  // Profile tab state
  const [profileData, setProfileData] = useState({
    name: '',
  });
  const [profileErrors, setProfileErrors] = useState({});
  const [profileSuccess, setProfileSuccess] = useState(false);
  
  // Email tab state
  const [emailData, setEmailData] = useState({
    email: '',
    currentPassword: '',
  });
  const [emailErrors, setEmailErrors] = useState({});
  const [emailSuccess, setEmailSuccess] = useState(false);
  
  // Password tab state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  
  const [submitError, setSubmitError] = useState('');

  // Initialize form data when user data is available
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name,
      });
      
      setEmailData({
        email: user.email,
        currentPassword: '',
      });
    }
  }, [user]);

  // Handle tab changes
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSubmitError('');
    setProfileSuccess(false);
    setEmailSuccess(false);
    setPasswordSuccess(false);
  };

  // Generic change handler for all forms
  const handleChange = (e, formSetter, errorsSetter) => {
    const { name, value } = e.target;
    formSetter(prev => ({ ...prev, [name]: value }));
    
    // Clear field error when typing
    errorsSetter(prev => ({ ...prev, [name]: '' }));
    
    // Clear submission error and success messages
    setSubmitError('');
    setProfileSuccess(false);
    setEmailSuccess(false);
    setPasswordSuccess(false);
  };

  // Validate profile form
  const validateProfileForm = () => {
    const errors = {};
    
    if (!profileData.name.trim()) {
      errors.name = 'Name is required';
    }
    
    setProfileErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Validate email form
  const validateEmailForm = () => {
    const errors = {};
    
    if (!emailData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(emailData.email)) {
      errors.email = 'Email is invalid';
    }
    
    if (!emailData.currentPassword) {
      errors.currentPassword = 'Current password is required to change email';
    }
    
    setEmailErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Validate password form
  const validatePasswordForm = () => {
    const errors = {};
    
    if (!passwordData.currentPassword) {
      errors.currentPassword = 'Current password is required';
    }
    
    if (!passwordData.newPassword) {
      errors.newPassword = 'New password is required';
    } else if (passwordData.newPassword.length < 8) {
      errors.newPassword = 'New password must be at least 8 characters';
    }
    
    if (!passwordData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your new password';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle profile update
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    
    if (validateProfileForm()) {
      try {
        await updateProfile({ name: profileData.name });
        setProfileSuccess(true);
      } catch (error) {
        setSubmitError(error.message || 'Failed to update profile. Please try again.');
      }
    }
  };

  // Handle email update
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    
    if (validateEmailForm()) {
      try {
        await updateProfile({
          email: emailData.email,
          currentPassword: emailData.currentPassword,
        });
        setEmailSuccess(true);
        setEmailData(prev => ({ ...prev, currentPassword: '' }));
      } catch (error) {
        setSubmitError(error.message || 'Failed to update email. Please try again.');
      }
    }
  };

  // Handle password update
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (validatePasswordForm()) {
      try {
        await updateProfile({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        });
        setPasswordSuccess(true);
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      } catch (error) {
        setSubmitError(error.message || 'Failed to update password. Please try again.');
      }
    }
  };

  if (isLoading || !user) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Navbar */}
      <Navbar />
      
      {/* Main content */}
      <main className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-700">
          <div className="p-6 sm:p-8">
            <h1 className="text-2xl font-bold text-gray-100 mb-6">Account Settings</h1>
            
            {/* Tabs */}
            <div className="border-b border-gray-700 mb-6">
              <nav className="flex space-x-8">
                <button
                  onClick={() => handleTabChange('profile')}
                  className={`pb-4 px-1 font-medium text-sm ${
                    activeTab === 'profile'
                      ? 'text-blue-400 border-b-2 border-blue-400'
                      : 'text-gray-400 hover:text-gray-300'
                  }`}
                >
                  Profile
                </button>
                <button
                  onClick={() => handleTabChange('email')}
                  className={`pb-4 px-1 font-medium text-sm ${
                    activeTab === 'email'
                      ? 'text-blue-400 border-b-2 border-blue-400'
                      : 'text-gray-400 hover:text-gray-300'
                  }`}
                >
                  Email
                </button>
                <button
                  onClick={() => handleTabChange('password')}
                  className={`pb-4 px-1 font-medium text-sm ${
                    activeTab === 'password'
                      ? 'text-blue-400 border-b-2 border-blue-400'
                      : 'text-gray-400 hover:text-gray-300'
                  }`}
                >
                  Password
                </button>
              </nav>
            </div>
            
            {/* Error message */}
            {(submitError || authError) && (
              <div className="bg-red-900/50 border border-red-800 text-red-100 px-4 py-3 rounded mb-6">
                {submitError || authError}
              </div>
            )}
            
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <>
                {profileSuccess && (
                  <div className="bg-green-900/50 border border-green-800 text-green-100 px-4 py-3 rounded mb-6">
                    Profile updated successfully!
                  </div>
                )}
                
                <form onSubmit={handleProfileSubmit} className="space-y-6">
                  <Input
                    label="Name"
                    id="profile-name"
                    name="name"
                    value={profileData.name}
                    onChange={(e) => handleChange(e, setProfileData, setProfileErrors)}
                    error={profileErrors.name}
                    placeholder="Your name"
                    disabled={isLoading}
                  />
                  
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </form>
              </>
            )}
            
            {/* Email Tab */}
            {activeTab === 'email' && (
              <>
                {emailSuccess && (
                  <div className="bg-green-900/50 border border-green-800 text-green-100 px-4 py-3 rounded mb-6">
                    Email updated successfully!
                  </div>
                )}
                
                <form onSubmit={handleEmailSubmit} className="space-y-6">
                  <Input
                    label="Email"
                    id="email"
                    name="email"
                    type="email"
                    value={emailData.email}
                    onChange={(e) => handleChange(e, setEmailData, setEmailErrors)}
                    error={emailErrors.email}
                    placeholder="you@example.com"
                    disabled={isLoading}
                  />
                  
                  <Input
                    label="Current Password"
                    id="email-current-password"
                    name="currentPassword"
                    type="password"
                    value={emailData.currentPassword}
                    onChange={(e) => handleChange(e, setEmailData, setEmailErrors)}
                    error={emailErrors.currentPassword}
                    placeholder="••••••••"
                    disabled={isLoading}
                  />
                  
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Updating...' : 'Update Email'}
                    </Button>
                  </div>
                </form>
              </>
            )}
            
            {/* Password Tab */}
            {activeTab === 'password' && (
              <>
                {passwordSuccess && (
                  <div className="bg-green-900/50 border border-green-800 text-green-100 px-4 py-3 rounded mb-6">
                    Password updated successfully!
                  </div>
                )}
                
                <form onSubmit={handlePasswordSubmit} className="space-y-6">
                  <Input
                    label="Current Password"
                    id="password-current-password"
                    name="currentPassword"
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => handleChange(e, setPasswordData, setPasswordErrors)}
                    error={passwordErrors.currentPassword}
                    placeholder="••••••••"
                    disabled={isLoading}
                  />
                  
                  <Input
                    label="New Password"
                    id="new-password"
                    name="newPassword"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => handleChange(e, setPasswordData, setPasswordErrors)}
                    error={passwordErrors.newPassword}
                    placeholder="••••••••"
                    disabled={isLoading}
                  />
                  
                  <Input
                    label="Confirm New Password"
                    id="confirm-password"
                    name="confirmPassword"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => handleChange(e, setPasswordData, setPasswordErrors)}
                    error={passwordErrors.confirmPassword}
                    placeholder="••••••••"
                    disabled={isLoading}
                  />
                  
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Updating...' : 'Update Password'}
                    </Button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
