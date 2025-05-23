'use client';

import { useState } from 'react';
import { useServerGroupContext } from '../context/ServerGroupContext';
import Button from './Button';
import Input from './Input';
import toast from 'react-hot-toast';

export default function ServerGroupForm({ onClose, existingGroup = null }) {
  const { addServerGroup, updateServerGroup } = useServerGroupContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: existingGroup?.name || '',
    description: existingGroup?.description || '',
    variables: existingGroup?.variables || {}
  });
  const [newVariable, setNewVariable] = useState({ key: '', value: '' });
  const [formErrors, setFormErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleVariableKeyChange = (e) => {
    setNewVariable(prev => ({ ...prev, key: e.target.value }));
  };

  const handleVariableValueChange = (e) => {
    setNewVariable(prev => ({ ...prev, value: e.target.value }));
  };

  const addVariable = () => {
    if (!newVariable.key.trim()) {
      return toast.error('Variable key cannot be empty');
    }

    setFormData(prev => ({
      ...prev,
      variables: {
        ...prev.variables,
        [newVariable.key]: newVariable.value
      }
    }));
    
    setNewVariable({ key: '', value: '' });
  };

  const removeVariable = (key) => {
    const updatedVariables = { ...formData.variables };
    delete updatedVariables[key];
    
    setFormData(prev => ({
      ...prev,
      variables: updatedVariables
    }));
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Group name is required';
    }
    
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    try {
      setIsSubmitting(true);
        if (existingGroup) {
        // Update existing group
        await updateServerGroup(existingGroup.id, formData);
        toast.success('Server group updated successfully');
        onClose();
      } else {
        // Add new group
        const newGroup = await addServerGroup(formData);
        toast.success('Server group added successfully');
        // Pass the new group ID back to the parent component
        onClose(newGroup.id);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error(existingGroup 
        ? 'Failed to update server group' 
        : 'Failed to add server group'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        id="name"
        name="name"
        label="Group Name"
        value={formData.name}
        onChange={handleInputChange}
        placeholder="Enter group name"
        error={formErrors.name}
        required
      />
      
      <div className="space-y-2">
        <label htmlFor="description" className="block text-sm font-medium text-gray-300">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          placeholder="Enter group description"
          rows="3"
          className="w-full rounded-md border border-gray-600 px-4 py-2 shadow-sm
          bg-gray-700 text-gray-100
          focus:border-blue-500 focus:outline-none focus:ring-blue-500"
        ></textarea>
      </div>
      
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-300">
          Group Variables
        </label>
        
        <div className="space-y-3">
          {/* Variable list */}
          {Object.keys(formData.variables).length > 0 && (
            <div className="bg-gray-900 rounded p-3 max-h-60 overflow-y-auto">
              <table className="w-full">
                <tbody>
                  {Object.entries(formData.variables).map(([key, value]) => (
                    <tr key={key} className="border-b border-gray-800">
                      <td className="py-2 pr-4 font-mono text-sm">{key}</td>
                      <td className="py-2 pr-4 font-mono text-sm text-gray-400 break-all">{value}</td>
                      <td className="py-2 text-right">
                        <button
                          type="button"
                          onClick={() => removeVariable(key)}
                          className="text-gray-400 hover:text-red-500"
                          aria-label="Remove variable"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {/* Add new variable */}
          <div className="flex space-x-2">
            <Input
              id="variableKey"
              name="variableKey"
              value={newVariable.key}
              onChange={handleVariableKeyChange}
              placeholder="Key"
              className="flex-1"
            />
            <Input
              id="variableValue"
              name="variableValue"
              value={newVariable.value}
              onChange={handleVariableValueChange}
              placeholder="Value"
              className="flex-1"
            />
            <Button 
              type="button" 
              onClick={addVariable}
              variant="secondary"
              className="whitespace-nowrap"
            >
              Add Variable
            </Button>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end space-x-2 pt-4">
        <Button
          type="button"
          onClick={onClose}
          variant="secondary"
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={isSubmitting}
        >
          {isSubmitting 
            ? (existingGroup ? 'Updating...' : 'Adding...') 
            : (existingGroup ? 'Update Group' : 'Add Group')}
        </Button>
      </div>
    </form>
  );
}