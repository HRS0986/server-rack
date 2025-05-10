'use client';

import { appwriteService } from './appwrite';

/**
 * Utility functions for handling permissions in the application
 */
export const permissionsService = {
  /**
   * Checks if a user can access a specific resource
   * @param {Object} user - The current user object
   * @param {Object} resource - The resource to check (server, application, etc.)
   * @param {string} action - The action to check ('read', 'update', 'delete')
   * @returns {boolean} - Whether the user can perform the action
   */
  canAccess: (user, resource, action) => {
    if (!user || !resource) return false;
    
    // Admin users can do anything
    if (appwriteService.isAdmin(user)) return true;
    
    // Users can only access their own resources
    if (resource.userId === user.$id) return true;
    
    // No other permissions granted
    return false;
  },

  /**
   * Checks if the current user is the owner of a resource
   * @param {Object} user - The current user object
   * @param {Object} resource - The resource to check (server, application, etc.)
   * @returns {boolean} - Whether the user is the owner
   */
  isOwner: (user, resource) => {
    if (!user || !resource) return false;
    return resource.userId === user.$id;
  },

  /**
   * Checks if the current user can create a specific resource type
   * @param {Object} user - The current user object
   * @param {string} resourceType - The type of resource ('server', 'application', etc.)
   * @returns {boolean} - Whether the user can create the resource
   */
  canCreate: (user, resourceType) => {
    if (!user) return false;
    
    // For now, any authenticated user can create resources
    // This could be expanded to check for specific permissions or quotas
    return true;
  },

  /**
   * Filters a list of resources to only include those the user can access
   * @param {Object} user - The current user object
   * @param {Array} resources - The array of resources to filter
   * @returns {Array} - The filtered list of resources
   */
  filterAccessibleResources: (user, resources) => {
    if (!user || !resources) return [];
    
    // Admin can access all resources
    if (appwriteService.isAdmin(user)) return resources;
    
    // Regular users can only access their own resources
    return resources.filter(resource => resource.userId === user.$id);
  }
};
