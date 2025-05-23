'use client';

import { useState, useEffect } from 'react';
import { useServerContext } from '../context/ServerContext';
import { useServerGroupContext } from '../context/ServerGroupContext';
import Button from './Button';
import Input from './Input';
import Modal from './Modal';
import ServerGroupForm from './ServerGroupForm';
import toast from 'react-hot-toast';

export default function ServerForm({ onClose }) {
  const { addServer, isLoading } = useServerContext();
  const { serverGroups, isLoaded: groupsLoaded } = useServerGroupContext();
  const [formData, setFormData] = useState({
    name: '',
    ipAddress: '',
    dns: '',
    username: '',
    groupId: '',
  });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  const [showAddGroupModal, setShowAddGroupModal] = useState(false);
  const [isGroupsEmpty, setIsGroupsEmpty] = useState(false);

  // Prevent hydration issues
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  // Check if there are any server groups
  useEffect(() => {
    if (groupsLoaded) {
      const noGroups = serverGroups.length === 0;
      setIsGroupsEmpty(noGroups);
      
      // If there are no groups, show the add group modal
      if (noGroups) {
        setShowAddGroupModal(true);
      } else if (serverGroups.length > 0) {
        // Pre-select the first group if available
        setFormData(prev => ({ ...prev, groupId: serverGroups[0].id }));
      }
    }
  }, [serverGroups, groupsLoaded]);

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
    
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
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
    
    if (!formData.groupId) {
      newErrors.groupId = 'Server group is required';
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
          <Input
          label="Username"
          id="username"
          name="username"
          value={formData.username}
          onChange={handleChange}
          error={errors.username}
          placeholder="admin"
          disabled={isLoading}
        />
        
        <div className="space-y-2">
          <label htmlFor="groupId" className="block text-sm font-medium text-gray-300">
            Server Group <span className="text-red-500">*</span>
          </label>
          <div className="flex space-x-2">
            <select
              id="groupId"
              name="groupId"
              value={formData.groupId}
              onChange={handleChange}
              className={`w-full rounded-md bg-gray-700 text-gray-100 border py-0 px-2 h-[45px] ${
                errors.groupId ? 'border-red-500' : 'border-gray-600'
              } focus:border-blue-500 focus:ring-blue-500`}
              disabled={isLoading || isGroupsEmpty}
            >
              <option value="">Select a server group</option>
              {serverGroups.map(group => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowAddGroupModal(true)}
              disabled={isLoading}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14m-7-7h14"></path>
            </svg>
            </Button>
          </div>
          {errors.groupId && (
            <p className="mt-1 text-sm text-red-500">{errors.groupId}</p>
          )}
        </div>
        
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
            disabled={isLoading || isGroupsEmpty}
          >
            {isLoading ? 'Adding...' : 'Add Server'}
          </Button>
        </div>      
      </form>
      
      {/* Add Group Modal */}
      {showAddGroupModal && (
        <Modal
          isOpen={showAddGroupModal}
          onClose={() => {
            // Only allow closing if there are groups
            if (!isGroupsEmpty) {
              setShowAddGroupModal(false);
            } else {
              toast.error('You must create a server group first');
            }
          }}
          title="Add New Server Group"
        >          <ServerGroupForm 
            onClose={(newGroupId) => {
              // If a new group was created, select it
              if (newGroupId) {
                setFormData(prev => ({ ...prev, groupId: newGroupId }));
              }
              setShowAddGroupModal(false);
            }} 
          />
        </Modal>
      )}
    </div>
  );
}
