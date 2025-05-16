'use client';

import { useState, useEffect } from 'react';
import { useServerContext } from '../context/ServerContext';
import Button from './Button';
import Modal from './Modal';
import ApplicationForm from './ApplicationForm';
import ServerEditForm from './ServerEditForm';
import ApplicationEditForm from './ApplicationEditForm';
import LoadingSpinner from './LoadingSpinner';

export default function ServerCard({ server }) {  
  const { deleteServer, isLoading, canEditServer, canDeleteServer } = useServerContext();
  const [isAddingApp, setIsAddingApp] = useState(false);
  const [isEditingServer, setIsEditingServer] = useState(false);
  const [editingApp, setEditingApp] = useState(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  
  // Prevent hydration issues
  useEffect(() => {
    setIsMounted(true);
    // Debug output
    console.log('ServerCard mounting for server:', server);
  }, [server]);

  // Debug when server data changes
  useEffect(() => {
    if (isMounted) {
      console.log('Server data in mounted component:', server);
    }
  }, [server, isMounted]);

  if (!isMounted) {
    return null;
  }
  const handleDeleteServer = async () => {
    try {
      setDeleteError('');
      await deleteServer(server.id);
      setShowConfirmDelete(false);
    } catch (error) {
      setDeleteError('Failed to delete server. Please try again.');
    }
  };

  const handleEditApp = (app) => {
    setEditingApp(app);
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-md p-5 border border-gray-700" suppressHydrationWarning>
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-bold text-gray-100">{server.name}</h3>
        <div className="flex space-x-2">
          {canEditServer(server) && (
            <Button 
              variant="secondary" 
              className="px-2 py-1 text-sm"
              onClick={() => setIsEditingServer(true)}
              disabled={isLoading}            >
              Edit
            </Button>
          )}
          {canDeleteServer(server) && (
            <Button 
              variant="danger" 
              className="px-2 py-1 text-sm"
              onClick={() => setShowConfirmDelete(true)}
              disabled={isLoading}
            >
              Delete
            </Button>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-2 mb-4">
        <div className="text-sm">
          <span className="font-medium text-gray-300">IP: </span>
          <span className="font-mono text-gray-100">{server.ipAddress}</span>
        </div>
        {server.dns && (
          <div className="text-sm">
            <span className="font-medium text-gray-300">DNS: </span>
            <span className="font-mono text-gray-100">{server.dns}</span>
          </div>
        )}
        {server.username && (
          <div className="text-sm">
            <span className="font-medium text-gray-300">Username: </span>
            <span className="font-mono text-gray-100">{server.username}</span>
          </div>
        )}
      </div>
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-md font-semibold text-gray-200">Applications</h4>          <Button 
            className="px-3 py-1 text-sm"
            onClick={() => setIsAddingApp(true)}
            disabled={isLoading}
          >
            Add App
          </Button>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center p-4">
            <LoadingSpinner />
          </div>
        ) : server.applications.length > 0 ? (
          <div className="border border-gray-700 rounded-md divide-y divide-gray-700">
            {server.applications.map(app => (
              <div key={app.id} className="p-3 flex justify-between items-center">
                <div>
                  <p className="font-medium text-gray-200">{app.name}</p>
                  {app.description && (
                    <p className="text-sm text-gray-400">{app.description}</p>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <div className="bg-gray-700 px-2 py-1 rounded font-mono text-sm text-gray-200">
                    Port: {app.port}
                  </div>                  <button 
                    onClick={() => handleEditApp(app)}
                    className="text-blue-400 hover:text-blue-300 p-1"
                    title="Edit Application"
                    disabled={isLoading}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-sm italic">No applications added yet</p>
        )}
      </div>

      {/* Add Application Modal */}
      <Modal
        isOpen={isAddingApp}
        onClose={() => setIsAddingApp(false)}
      >
        <ApplicationForm 
          serverId={server.id} 
          onClose={() => setIsAddingApp(false)} 
        />
      </Modal>

      {/* Edit Server Modal */}
      <Modal
        isOpen={isEditingServer}
        onClose={() => setIsEditingServer(false)}
      >
        <ServerEditForm 
          server={server} 
          onClose={() => setIsEditingServer(false)} 
        />
      </Modal>

      {/* Edit Application Modal */}
      <Modal
        isOpen={editingApp !== null}
        onClose={() => setEditingApp(null)}
      >
        {editingApp && (
          <ApplicationEditForm 
            serverId={server.id}
            app={editingApp}
            onClose={() => setEditingApp(null)} 
          />
        )}
      </Modal>

      {/* Confirm Delete Modal */}
      <Modal
        isOpen={showConfirmDelete}
        onClose={() => setShowConfirmDelete(false)}
      >        <div className="p-4">
          <h3 className="text-lg font-bold mb-2 text-gray-100">Confirm Delete</h3>
          
          {deleteError && (
            <div className="bg-red-900/50 border border-red-800 text-red-100 px-4 py-2 rounded mb-4">
              {deleteError}
            </div>
          )}
          
          <p className="mb-4 text-gray-200">
            Are you sure you want to delete {server.name}?
            This will also delete all applications associated with this server.
          </p>
          <div className="flex justify-end space-x-3">
            <Button 
              variant="secondary"
              onClick={() => setShowConfirmDelete(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              variant="danger"
              onClick={handleDeleteServer}
              disabled={isLoading}
            >
              {isLoading ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
