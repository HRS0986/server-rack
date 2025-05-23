'use client';

import { Client, Account, Databases, Query, ID } from 'appwrite';

// Initialize Appwrite client
const client = new Client();

// Load configuration from environment variables
const appwriteEndpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
const appwriteProjectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
const SERVERS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_SERVERS_COLLECTION_ID;
const APPLICATIONS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_APPLICATIONS_COLLECTION_ID;
const SERVER_GROUPS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_SERVER_GROUPS_COLLECTION_ID;

// Validate configuration
if (!appwriteEndpoint || !appwriteProjectId || !DATABASE_ID || !SERVERS_COLLECTION_ID || !APPLICATIONS_COLLECTION_ID || !SERVER_GROUPS_COLLECTION_ID) {
  console.log('Appwrite configuration is incomplete. Please check your .env.local file.');
  
  if (!appwriteEndpoint) console.log('Missing NEXT_PUBLIC_APPWRITE_ENDPOINT');
  if (!appwriteProjectId) console.log('Missing NEXT_PUBLIC_APPWRITE_PROJECT_ID');
  if (!DATABASE_ID) console.log('Missing NEXT_PUBLIC_APPWRITE_DATABASE_ID');
  if (!SERVERS_COLLECTION_ID) console.log('Missing NEXT_PUBLIC_APPWRITE_SERVERS_COLLECTION_ID');
  if (!APPLICATIONS_COLLECTION_ID) console.log('Missing NEXT_PUBLIC_APPWRITE_APPLICATIONS_COLLECTION_ID');
  if (!SERVER_GROUPS_COLLECTION_ID) console.log('Missing NEXT_PUBLIC_APPWRITE_SERVER_GROUPS_COLLECTION_ID');
}

// Configure the client
client
    .setEndpoint(appwriteEndpoint)
    .setProject(appwriteProjectId);

// Initialize Account and Database services
const account = new Account(client);
const databases = new Databases(client);

/**
 * Appwrite service utility for server-rack application
 */
export const appwriteService = {
    // Authentication methods
    createAccount: async (email, password, name) => {
        try {
            const newAccount = await account.create(
                ID.unique(),
                email,
                password,
                name
            );
            
            if (newAccount) {
                // Log in the user immediately after account creation
                return await appwriteService.login(email, password);
            } else {
                return null;
            }
        } catch (error) {
            console.log('Error creating account:', error);
            throw error;
        }
    },
    
    login: async (email, password) => {
        try {
            await account.createEmailPasswordSession(email, password);
            return await appwriteService.getCurrentUser();
        } catch (error) {
            console.log('Error during login:', error);
            throw error;
        }
    },
    
    logout: async () => {
        try {
            await account.deleteSession('current');
            return true;
        } catch (error) {
            console.log('Error during logout:', error);
            throw error;
        }
    },
    
    getCurrentUser: async () => {
        try {
            const user = await account.get();
            return user;
        } catch (error) {
            console.log('Error getting current user:', error);
            return null;
        }
    },
    
    forgotPassword: async (email) => {
        try {
            await account.createRecovery(email, `${window.location.origin}/reset-password`);
            return true;
        } catch (error) {
            console.log('Error during password recovery:', error);
            throw error;
        }
    },
    
    resetPassword: async (userId, secret, password, confirmPassword) => {
        if (password !== confirmPassword) {
            throw new Error('Passwords do not match');
        }
        
        try {
            await account.updateRecovery(userId, secret, password, confirmPassword);
            return true;
        } catch (error) {
            console.log('Error resetting password:', error);
            throw error;
        }
    },
    
    updateName: async (name) => {
        try {
            await account.updateName(name);
            return await appwriteService.getCurrentUser();
        } catch (error) {
            console.log('Error updating name:', error);
            throw error;
        }
    },
    
    updateEmail: async (email, password) => {
        try {
            await account.updateEmail(email, password);
            return await appwriteService.getCurrentUser();
        } catch (error) {
            console.log('Error updating email:', error);
            throw error;
        }
    },
    
    updatePassword: async (oldPassword, newPassword) => {
        try {
            await account.updatePassword(newPassword, oldPassword);
            return true;
        } catch (error) {
            console.log('Error updating password:', error);
            throw error;
        }
    },
    // Server methods
    getServers: async () => {
        try {
            const response = await databases.listDocuments(
                DATABASE_ID,
                SERVERS_COLLECTION_ID
            );
            
            // Fetch applications for each server
            const serversWithApps = await Promise.all(
                response.documents.map(async (server) => {
                    const apps = await appwriteService.getApplicationsByServer(server.$id);
                    return {
                        id: server.$id,
                        name: server.name,
                        username: server.username || '',
                        ipAddress: server.ipAddress,
                        dns: server.dns || '',
                        groupId: server.groupId || '', // Include group ID
                        userId: server.userId || '', // Include userId for permission checks
                        applications: apps
                    };
                })
            );
            
            console.log('Processed servers with userId:', serversWithApps);
            return serversWithApps;
        } catch (error) {
            console.log('Error fetching servers:', error);
            return [];
        }
    },    getServer: async (id) => {
        try {
            const server = await databases.getDocument(
                DATABASE_ID,
                SERVERS_COLLECTION_ID,
                id
            );
            
            const applications = await appwriteService.getApplicationsByServer(id);
            
            return {
                id: server.$id,
                name: server.name,
                ipAddress: server.ipAddress,
                dns: server.dns || '',
                username: server.username || '',
                groupId: server.groupId || '',
                applications
            };
        } catch (error) {
            console.log('Error fetching server:', error);
            throw error;
        }
    },    addServer: async (serverData) => {
        try {
            const currentUser = await appwriteService.getCurrentUser();
            const userId = currentUser ? currentUser.$id : '';
            
            // Create document with only the fields defined in the Appwrite collection schema
            const response = await databases.createDocument(
                DATABASE_ID,
                SERVERS_COLLECTION_ID,
                ID.unique(),                {
                    name: serverData.name,
                    ipAddress: serverData.ipAddress,
                    dns: serverData.dns || '',
                    username: serverData.username || '',
                    groupId: serverData.groupId || ''
                }
            );
              return {                
                id: response.$id,
                name: response.name,
                ipAddress: response.ipAddress,
                dns: response.dns || '',
                username: response.username || '',
                groupId: serverData.groupId || '',
                userId: userId,
                applications: []
            };
        } catch (error) {
            console.log('Error adding server:', error);
            throw error;
        }
    },    updateServer: async (id, serverData) => {
        debugger;
        try {
            const response = await databases.updateDocument(
                DATABASE_ID,
                SERVERS_COLLECTION_ID,
                id,
                {
                    name: serverData.name,
                    ipAddress: serverData.ipAddress,
                    dns: serverData.dns || '',
                    username: serverData.username || '',
                    groupId: serverData.groupId || ''
                }
            );              return {
                id: response.$id,
                name: response.name,
                ipAddress: response.ipAddress,
                dns: response.dns || '',
                username: response.username || '',
                groupId: response.groupId || ''
            };
        } catch (error) {
            console.log('Error updating server:', error);
            throw error;
        }
    },

    deleteServer: async (id) => {
        try {
            // First delete all applications for this server
            const applications = await appwriteService.getApplicationsByServer(id);
            
            for (const app of applications) {
                await appwriteService.deleteApplication(app.id);
            }
            
            // Then delete the server
            await databases.deleteDocument(
                DATABASE_ID,
                SERVERS_COLLECTION_ID,
                id
            );
            
            return true;
        } catch (error) {
            console.log('Error deleting server:', error);
            throw error;
        }
    },

    // Application methods
    getApplicationsByServer: async (serverId) => {
        try {
            const response = await databases.listDocuments(
                DATABASE_ID,
                APPLICATIONS_COLLECTION_ID,
                [
                    Query.equal('serverId', serverId)
                ]
            );
            
            return response.documents.map(app => ({
                id: app.$id,
                name: app.name,
                port: app.port,
                description: app.description || '',
                serverId: app.serverId
            }));
        } catch (error) {
            console.log('Error fetching applications:', error);
            return [];
        }
    },

    addApplication: async (serverId, appData) => {
        try {
            const response = await databases.createDocument(
                DATABASE_ID,
                APPLICATIONS_COLLECTION_ID,
                ID.unique(),
                {
                    name: appData.name,
                    port: appData.port,
                    description: appData.description || '',
                    serverId: serverId
                }
            );
            
            return {
                id: response.$id,
                name: response.name,
                port: response.port,
                description: response.description || '',
                serverId: response.serverId
            };
        } catch (error) {
            console.log('Error adding application:', error);
            throw error;
        }
    },

    updateApplication: async (appId, appData) => {
        try {
            const response = await databases.updateDocument(
                DATABASE_ID,
                APPLICATIONS_COLLECTION_ID,
                appId,
                {
                    name: appData.name,
                    port: appData.port,
                    description: appData.description || ''
                    // We do not update serverId as the application remains with the same server
                }
            );
            
            return {
                id: response.$id,
                name: response.name,
                port: response.port,
                description: response.description || '',
                serverId: response.serverId
            };
        } catch (error) {
            console.log('Error updating application:', error);
            throw error;
        }
    },

    deleteApplication: async (appId) => {
        try {
            await databases.deleteDocument(
                DATABASE_ID,
                APPLICATIONS_COLLECTION_ID,
                appId
            );
            
            return true;
        } catch (error) {
            console.log('Error deleting application:', error);
            throw error;
        }
    },

    // User role management
    hasRole: (user, role) => {
        if (!user || !user.labels) return false;
        return user.labels.includes(role);
    },
    
    isAdmin: (user) => {
        return appwriteService.hasRole(user, 'admin');
    },
      // Server Group methods
    getServerGroups: async () => {
        try {
            const response = await databases.listDocuments(
                DATABASE_ID,
                SERVER_GROUPS_COLLECTION_ID
            );
            
            return response.documents.map(group => ({
                id: group.$id,
                name: group.name,
                description: group.description || '',
                variables: group.variables ? JSON.parse(group.variables) : {},
                serverCount: group.serverCount || 0
            }));
        } catch (error) {
            console.log('Error fetching server groups:', error);
            return [];
        }
    },
      getServerGroup: async (id) => {
        try {
            const group = await databases.getDocument(
                DATABASE_ID,
                SERVER_GROUPS_COLLECTION_ID,
                id
            );
            
            // Fetch servers in this group
            const servers = await appwriteService.getServersInGroup(id);
            
            return {
                id: group.$id,
                name: group.name,
                description: group.description || '',
                variables: group.variables ? JSON.parse(group.variables) : {},
                servers: servers,
                serverCount: servers.length
            };
        } catch (error) {
            console.log('Error fetching server group:', error);
            throw error;
        }
    },
      addServerGroup: async (groupData) => {
        try {
            const currentUser = await appwriteService.getCurrentUser();
            const userId = currentUser ? currentUser.$id : '';
            
            // Convert variables object to JSON string
            const variablesStr = JSON.stringify(groupData.variables || {});
            
            const response = await databases.createDocument(
                DATABASE_ID,
                SERVER_GROUPS_COLLECTION_ID,
                ID.unique(),
                {
                    name: groupData.name,
                    description: groupData.description || '',
                    variables: variablesStr,
                    serverCount: 0,
                }
            );

            return {
                id: response.$id,
                name: response.name,
                description: response.description || '',
                variables: groupData.variables || {},  // Return the original object
                serverCount: 0,
                userId: userId
            };
        } catch (error) {
            console.log('Error adding server group:', error);
            throw error;
        }
    },
      updateServerGroup: async (id, groupData) => {
        try {
            // Convert variables object to JSON string
            const variablesStr = JSON.stringify(groupData.variables || {});
            
            const response = await databases.updateDocument(
                DATABASE_ID,
                SERVER_GROUPS_COLLECTION_ID,
                id,
                {
                    name: groupData.name,
                    description: groupData.description || '',
                    variables: variablesStr
                }
            );
            
            return {
                id: response.$id,
                name: response.name,
                description: response.description || '',
                variables: groupData.variables || {}, // Return the original object
                serverCount: response.serverCount || 0
            };
        } catch (error) {
            console.log('Error updating server group:', error);
            throw error;
        }
    },
    
    deleteServerGroup: async (id) => {
        try {
            // First update any servers in this group to remove the group association
            const servers = await appwriteService.getServersInGroup(id);
            
            for (const server of servers) {
                await appwriteService.updateServer(server.id, { ...server, groupId: null });
            }
            
            // Then delete the group
            await databases.deleteDocument(
                DATABASE_ID,
                SERVER_GROUPS_COLLECTION_ID,
                id
            );
            
            return true;
        } catch (error) {
            console.log('Error deleting server group:', error);
            throw error;
        }
    },
    
    getServersInGroup: async (groupId) => {
        try {
            const response = await databases.listDocuments(
                DATABASE_ID,
                SERVERS_COLLECTION_ID,
                [
                    Query.equal('groupId', groupId)
                ]
            );
            
            // Fetch applications for each server
            const serversWithApps = await Promise.all(
                response.documents.map(async (server) => {
                    const apps = await appwriteService.getApplicationsByServer(server.$id);
                    return {
                        id: server.$id,
                        name: server.name,
                        username: server.username || '',
                        ipAddress: server.ipAddress,
                        dns: server.dns || '',
                        groupId: server.groupId,
                        applications: apps
                    };
                })
            );
            
            return serversWithApps;
        } catch (error) {
            console.log('Error fetching servers in group:', error);
            return [];
        }
    },
    
    addServerToGroup: async (serverId, groupId) => {
        try {
            // Update server to add group reference
            await appwriteService.updateServer(serverId, { groupId });
            
            // Get the updated server count for this group
            const servers = await appwriteService.getServersInGroup(groupId);
            
            // Update the group's server count
            await databases.updateDocument(
                DATABASE_ID,
                SERVER_GROUPS_COLLECTION_ID,
                groupId,
                {
                    serverCount: servers.length
                }
            );
            
            return true;
        } catch (error) {
            console.log('Error adding server to group:', error);
            throw error;
        }
    },
    
    removeServerFromGroup: async (serverId, groupId) => {
        try {
            // Update server to remove group reference
            await appwriteService.updateServer(serverId, { groupId: null });
            
            // Get the updated server count for this group
            const servers = await appwriteService.getServersInGroup(groupId);
            
            // Update the group's server count
            await databases.updateDocument(
                DATABASE_ID,
                SERVER_GROUPS_COLLECTION_ID,
                groupId,
                {
                    serverCount: servers.length
                }
            );
            
            return true;
        } catch (error) {
            console.log('Error removing server from group:', error);
            throw error;
        }
    },
    
    // Note: To update user roles, you would need a server-side function 
    // as client-side code can't update user labels directly in Appwrite
    // This would be implemented with Appwrite Functions
};

export default client;
