'use client';

import { useState, useEffect } from 'react';
import { useServerContext } from '../context/ServerContext';
import Button from './Button';
import Input from './Input';

export default function ServerForm({ onClose }) {
  const { addServer, isLoading } = useServerContext();
  const [formData, setFormData] = useState({
    name: '',
    ipAddress: '',
    dns: '',
  });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [isMounted, setIsMounted] = useState(false);

  // Prevent hydration issues
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field when changing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    // Clear submission error when form is updated
    if (submitError) {
      setSubmitError('');
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Server name is required';
    }
    
    if (!formData.ipAddress.trim()) {
      newErrors.ipAddress = 'IP address is required';
    } else {
      // Simple IP validation, can be enhanced
      const ipPattern = /^(\d{1,3}\.){3}\d{1,3}$/;
      if (!ipPattern.test(formData.ipAddress)) {
        newErrors.ipAddress = 'Invalid IP address format';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      try {
        await addServer(formData);
        onClose();
      } catch (error) {
        setSubmitError('Failed to add server. Please try again.');
      }
    }
  };
  
  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md border border-gray-700" suppressHydrationWarning>
      <h2 className="text-xl font-bold mb-4 text-gray-100">Add New Server</h2>
      
      {submitError && (
        <div className="bg-red-900/50 border border-red-800 text-red-100 px-4 py-2 rounded mb-4">
          {submitError}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Server Name"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          placeholder="Production Server"
          required
          disabled={isLoading}
        />
        
        <Input
          label="IP Address"
          id="ipAddress"
          name="ipAddress"
          value={formData.ipAddress}
          onChange={handleChange}
          error={errors.ipAddress}
          placeholder="192.168.1.1"
          required
          disabled={isLoading}
        />
        
        <Input
          label="DNS Name"
          id="dns"
          name="dns"
          value={formData.dns}
          onChange={handleChange}
          error={errors.dns}
          placeholder="server.example.com"
          disabled={isLoading}
        />
        
        <div className="flex justify-end space-x-3 pt-2">
          <Button 
            variant="secondary" 
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? 'Adding...' : 'Add Server'}
          </Button>
        </div>      
      </form>
    </div>
  );
}
