'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { appwriteService } from '../utils/appwrite';
import { permissionsService } from '../utils/permissions';
import { useAuth } from './AuthContext';

// Context for managing server and application data
const ServerContext = createContext(undefined);

export function ServerProvider({ children }) {
  // State for servers and loading status
  const [servers, setServers] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Get current user from auth context
  const { user } = useAuth();

  // Load data from Appwrite on component mount
  useEffect(() => {
    const fetchServers = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const serverData = await appwriteService.getServers();
        setServers(serverData);
        setIsLoaded(true);
        console.log('Fetched servers:', serverData);
      } catch (err) {
        console.log('Error fetching servers:', err);
        setError('Failed to load servers. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchServers();
  }, []);

  // Add a new server
  const addServer = async (serverData) => {
    try {
      setIsLoading(true);
      setError(null);
      const newServer = await appwriteService.addServer(serverData);
      setServers(prev => [...prev, newServer]);
      return newServer.id;
    } catch (err) {
      console.log('Error adding server:', err);
      setError('Failed to add server. Please try again later.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Update an existing server
  const updateServer = async (id, serverData) => {
    try {
      setIsLoading(true);
      setError(null);
      await appwriteService.updateServer(id, serverData);
      setServers(prev => 
        prev.map(server => 
          server.id === id 
          ? { ...server, ...serverData } 
          : server
        )
      );
    } catch (err) {
      console.log('Error updating server:', err);
      setError('Failed to update server. Please try again later.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Delete a server
  const deleteServer = async (id) => {
    try {
      setIsLoading(true);
      setError(null);
      await appwriteService.deleteServer(id);
      setServers(prev => prev.filter(server => server.id !== id));
    } catch (err) {
      console.log('Error deleting server:', err);
      setError('Failed to delete server. Please try again later.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Add an application to a server
  const addApplication = async (serverId, appData) => {
    try {
      setIsLoading(true);
      setError(null);
      const newApp = await appwriteService.addApplication(serverId, appData);
      
      setServers(prev => 
        prev.map(server => 
          server.id === serverId 
          ? { 
              ...server, 
              applications: [...server.applications, newApp] 
            } 
          : server
        )
      );
      
      return newApp.id;
    } catch (err) {
      console.log('Error adding application:', err);
      setError('Failed to add application. Please try again later.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Update an application
  const updateApplication = async (serverId, appId, appData) => {
    try {
      setIsLoading(true);
      setError(null);
      await appwriteService.updateApplication(appId, appData);
      
      setServers(prev => 
        prev.map(server => 
          server.id === serverId 
          ? { 
              ...server, 
              applications: server.applications.map(app => 
                app.id === appId 
                ? { ...app, ...appData } 
                : app
              ) 
            } 
          : server
        )
      );
    } catch (err) {
      console.log('Error updating application:', err);
      setError('Failed to update application. Please try again later.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Delete an application
  const deleteApplication = async (serverId, appId) => {
    try {
      setIsLoading(true);
      setError(null);
      await appwriteService.deleteApplication(appId);
      
      setServers(prev => 
        prev.map(server => 
          server.id === serverId 
          ? { 
              ...server, 
              applications: server.applications.filter(app => app.id !== appId) 
            } 
          : server
        )
      );
    } catch (err) {
      console.log('Error deleting application:', err);
      setError('Failed to delete application. Please try again later.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Access control methods
  const canEditServer = (server) => {
    return permissionsService.canAccess(user, server, 'update');
  };

  const canDeleteServer = (server) => {
    return permissionsService.canAccess(user, server, 'delete');
  };

  const filterAccessibleServers = () => {
    return permissionsService.filterAccessibleResources(user, servers);
  };

  // Context value
  const value = {
    servers: user ? filterAccessibleServers() : [],
    isLoaded,
    isLoading,
    error,
    addServer,
    updateServer,
    deleteServer,
    addApplication,
    updateApplication,
    deleteApplication,
    canEditServer,
    canDeleteServer,
  };
  return (
    <ServerContext.Provider value={value}>
      {children}
    </ServerContext.Provider>
  );
}

// Custom hook to use the server context
export function useServerContext() {
  const context = useContext(ServerContext);
  if (context === undefined) {
    throw new Error('useServerContext must be used within a ServerProvider');
  }
  return context;
}
