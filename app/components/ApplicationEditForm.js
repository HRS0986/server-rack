'use client';

import { useState, useEffect } from 'react';
import { useServerContext } from '../context/ServerContext';
import Button from './Button';
import Input from './Input';

export default function ApplicationEditForm({ serverId, app, onClose }) {
  const { updateApplication, deleteApplication, isLoading } = useServerContext();
  const [formData, setFormData] = useState({
    name: app.name,
    port: app.port.toString(),
    description: app.description || '',
  });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
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
      newErrors.name = 'Application name is required';
    }
    
    if (!formData.port.trim()) {
      newErrors.port = 'Port number is required';
    } else {
      // Port validation: must be a number between 1-65535
      const port = parseInt(formData.port);
      if (isNaN(port) || port < 1 || port > 65535) {
        newErrors.port = 'Port must be a number between 1-65535';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      try {
        await updateApplication(serverId, app.id, {
          ...formData,
          port: parseInt(formData.port),
        });
        onClose();
      } catch (error) {
        setSubmitError('Failed to update application. Please try again.');
      }
    }
  };

  const handleDelete = async () => {
    try {
      await deleteApplication(serverId, app.id);
      onClose();
    } catch (error) {
      setSubmitError('Failed to delete application. Please try again.');
      setConfirmDelete(false);
    }
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md border border-gray-700" suppressHydrationWarning>
      <h2 className="text-xl font-bold mb-4 text-gray-100">Edit Application</h2>
      
      {submitError && (
        <div className="bg-red-900/50 border border-red-800 text-red-100 px-4 py-2 rounded mb-4">
          {submitError}
        </div>
      )}
      
      {confirmDelete ? (
        <div>
          <p className="text-gray-200 mb-4">
            Are you sure you want to delete the application "{app.name}"?
          </p>
          <div className="flex justify-end space-x-3">
            <Button 
              variant="secondary" 
              onClick={() => setConfirmDelete(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              disabled={isLoading}
            >
              {isLoading ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Application Name"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
            placeholder="Web Server"
            required
            disabled={isLoading}
          />
          
          <Input
            label="Port"
            id="port"
            name="port"
            type="number"
            min="1"
            max="65535"
            value={formData.port}
            onChange={handleChange}
            error={errors.port}
            placeholder="80"
            required
            disabled={isLoading}
          />
          
          <Input
            label="Description (optional)"
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            error={errors.description}
            placeholder="Nginx web server for frontend"
            disabled={isLoading}
          />
          
          <div className="flex justify-between space-x-3 pt-2">
            <Button 
              variant="danger" 
              type="button"
              onClick={() => setConfirmDelete(true)}
              disabled={isLoading}
            >
              Delete
            </Button>
            
            <div className="flex space-x-3">
              <Button 
                variant="secondary" 
                type="button" 
                onClick={onClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
