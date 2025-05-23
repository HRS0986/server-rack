'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { appwriteService } from '../utils/appwrite';
import { useAuth } from './AuthContext';

// Context for managing server groups
const ServerGroupContext = createContext(undefined);

export function ServerGroupProvider({ children }) {
  const [serverGroups, setServerGroups] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const { user } = useAuth();

  // Load data from Appwrite on component mount
  useEffect(() => {
    const fetchServerGroups = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const groupData = await appwriteService.getServerGroups();
        
        if (Array.isArray(groupData)) {
          console.log('Fetched server groups:', groupData);
          setServerGroups(groupData);
        } else {
          console.error('Error: groupData is not an array:', groupData);
          setServerGroups([]);
          setError('Invalid server group data format received');
        }
        setIsLoaded(true);
      } catch (err) {
        console.log('Error fetching server groups:', err);
        setError('Failed to load server groups. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchServerGroups();
  }, []);

  // Add a new server group
  const addServerGroup = async (groupData) => {
    try {
      setIsLoading(true);
      setError(null);
      const newGroup = await appwriteService.addServerGroup(groupData);
      setServerGroups(prev => [...prev, newGroup]);
      return newGroup.id;
    } catch (err) {
      console.log('Error adding server group:', err);
      setError('Failed to add server group. Please try again later.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Update an existing server group
  const updateServerGroup = async (id, groupData) => {
    try {
      setIsLoading(true);
      setError(null);
      await appwriteService.updateServerGroup(id, groupData);
      setServerGroups(prev => 
        prev.map(group => 
          group.id === id 
          ? { ...group, ...groupData } 
          : group
        )
      );
    } catch (err) {
      console.log('Error updating server group:', err);
      setError('Failed to update server group. Please try again later.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Delete a server group
  const deleteServerGroup = async (id) => {
    try {
      setIsLoading(true);
      setError(null);
      await appwriteService.deleteServerGroup(id);
      setServerGroups(prev => prev.filter(group => group.id !== id));
    } catch (err) {
      console.log('Error deleting server group:', err);
      setError('Failed to delete server group. Please try again later.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Get servers in a specific group
  const getServersInGroup = async (groupId) => {
    try {
      setIsLoading(true);
      setError(null);
      const servers = await appwriteService.getServersInGroup(groupId);
      return servers;
    } catch (err) {
      console.log('Error getting servers in group:', err);
      setError('Failed to load servers in this group. Please try again later.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Context value
  const value = {
    serverGroups: user ? serverGroups : [],
    isLoaded,
    isLoading,
    error,
    addServerGroup,
    updateServerGroup,
    deleteServerGroup,
    getServersInGroup
  };
  
  return (
    <ServerGroupContext.Provider value={value}>
      {children}
    </ServerGroupContext.Provider>
  );
}

// Custom hook to use the server group context
export function useServerGroupContext() {
  const context = useContext(ServerGroupContext);
  if (context === undefined) {
    throw new Error('useServerGroupContext must be used within a ServerGroupProvider');
  }
  return context;
}
