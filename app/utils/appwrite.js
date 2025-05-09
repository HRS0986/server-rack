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

// Validate configuration
if (!appwriteEndpoint || !appwriteProjectId || !DATABASE_ID || !SERVERS_COLLECTION_ID || !APPLICATIONS_COLLECTION_ID) {
  console.error('Appwrite configuration is incomplete. Please check your .env.local file.');
  
  if (!appwriteEndpoint) console.error('Missing NEXT_PUBLIC_APPWRITE_ENDPOINT');
  if (!appwriteProjectId) console.error('Missing NEXT_PUBLIC_APPWRITE_PROJECT_ID');
  if (!DATABASE_ID) console.error('Missing NEXT_PUBLIC_APPWRITE_DATABASE_ID');
  if (!SERVERS_COLLECTION_ID) console.error('Missing NEXT_PUBLIC_APPWRITE_SERVERS_COLLECTION_ID');
  if (!APPLICATIONS_COLLECTION_ID) console.error('Missing NEXT_PUBLIC_APPWRITE_APPLICATIONS_COLLECTION_ID');
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
    // Account methods
    getCurrentUser: async () => {
        try {
            return await account.get();
        } catch (error) {
            console.error('Error getting current user:', error);
            return null;
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
                        ipAddress: server.ipAddress,
                        dns: server.dns || '',
                        applications: apps
                    };
                })
            );
            
            return serversWithApps;
        } catch (error) {
            console.error('Error fetching servers:', error);
            return [];
        }
    },

    getServer: async (id) => {
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
                applications
            };
        } catch (error) {
            console.error('Error fetching server:', error);
            throw error;
        }
    },

    addServer: async (serverData) => {
        try {
            const response = await databases.createDocument(
                DATABASE_ID,
                SERVERS_COLLECTION_ID,
                ID.unique(),
                {
                    name: serverData.name,
                    ipAddress: serverData.ipAddress,
                    dns: serverData.dns || ''
                }
            );
            
            return {
                id: response.$id,
                name: response.name,
                ipAddress: response.ipAddress,
                dns: response.dns || '',
                applications: []
            };
        } catch (error) {
            console.error('Error adding server:', error);
            throw error;
        }
    },

    updateServer: async (id, serverData) => {
        try {
            const response = await databases.updateDocument(
                DATABASE_ID,
                SERVERS_COLLECTION_ID,
                id,
                {
                    name: serverData.name,
                    ipAddress: serverData.ipAddress,
                    dns: serverData.dns || ''
                }
            );
            
            return {
                id: response.$id,
                name: response.name,
                ipAddress: response.ipAddress,
                dns: response.dns || ''
            };
        } catch (error) {
            console.error('Error updating server:', error);
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
            console.error('Error deleting server:', error);
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
            console.error('Error fetching applications:', error);
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
            console.error('Error adding application:', error);
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
                    // We don't update serverId as the application remains with the same server
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
            console.error('Error updating application:', error);
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
            console.error('Error deleting application:', error);
            throw error;
        }
    }
};

export default client;
