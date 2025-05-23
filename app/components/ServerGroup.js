'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useServerGroupContext } from '../context/ServerGroupContext';
import Button from './Button';
import Modal from './Modal';
import ServerGroupForm from './ServerGroupForm';
import toast from 'react-hot-toast';

export default function ServerGroup({ group }) {
  const { deleteServerGroup } = useServerGroupContext();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showVariables, setShowVariables] = useState(false);
  const [showEditGroupModal, setShowEditGroupModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteServerGroup(group.id);
      toast.success('Server group deleted successfully');
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('Failed to delete server group:', error);
      toast.error('Failed to delete server group');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleViewGroup = () => {
    router.push(`/server-group/${group.id}`);
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-md p-5 border border-gray-700 hover:border-gray-600 transition-colors">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-medium text-gray-200">{group.name}</h3>
        <div className="flex space-x-2">          <Button 
            variant="secondary" 
            className="p-1"
            onClick={() => setShowEditGroupModal(true)}
            disabled={isDeleting}
            title="Edit Server Group"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </Button>        
          <Button 
            variant="danger" 
            className="p-1"
            onClick={() => setShowDeleteConfirm(true)}
            disabled={isDeleting}
            title="Delete Server Group"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18"></path>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>
              <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </Button>        
        </div>
      </div>
      
      <p className="text-gray-400 mb-4">{group.description || 'No description provided'}</p>

      <div className="flex items-center mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-gray-500">
          <rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect>
          <rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect>
          <line x1="6" y1="6" x2="6.01" y2="6"></line>
          <line x1="6" y1="18" x2="6.01" y2="18"></line>
        </svg>
        <span className="text-gray-400">{group.serverCount || 0} servers</span>
      </div>
      
      <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
        <Button onClick={handleViewGroup} variant="primary" fullwidth="true">
          View Group
        </Button>
        <Button onClick={() => setShowVariables(true)} variant="secondary" fullwidth="true">
          View Variables
        </Button>
      </div>
      
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <Modal
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          title="Delete Server Group"
        >
          <div className="p-4">
            <p className="mb-4 text-gray-300">
              Are you sure you want to delete the group "{group.name}"? This will permanently remove this group, but will not delete the servers in it.
            </p>
            <div className="flex justify-end space-x-2">
              <Button 
                onClick={() => setShowDeleteConfirm(false)}
                variant="secondary"
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleDelete}
                variant="danger"
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete Group'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
      
      {/* Group Variables Modal */}
      {showVariables && (
        <Modal
          isOpen={showVariables}
          onClose={() => setShowVariables(false)}
          title="Group Variables"
        >
          <div className="p-4">
            {Object.keys(group.variables || {}).length > 0 ? (
              <div className="bg-gray-900 rounded p-4 overflow-auto max-h-96">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="text-left pb-2 border-b border-gray-700 text-gray-400">Key</th>
                      <th className="text-left pb-2 border-b border-gray-700 text-gray-400">Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(group.variables || {}).map(([key, value]) => (
                      <tr key={key}>
                        <td className="py-2 pr-4 border-b border-gray-800 font-mono text-sm">{key}</td>
                        <td className="py-2 border-b border-gray-800 font-mono text-sm break-all">{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-400">No variables defined for this group.</p>
            )}
            <div className="mt-4 flex justify-end">
              <Button onClick={() => setShowVariables(false)}>
                Close
              </Button>
            </div>          </div>
        </Modal>
      )}
        {/* Edit Group Modal */}
      {showEditGroupModal && (
        <Modal
          isOpen={showEditGroupModal}
          onClose={() => setShowEditGroupModal(false)}
          title="Edit Server Group"
        >
          <ServerGroupForm 
            onClose={(updatedGroupId) => {
              // If the group was successfully updated, close the modal
              if (updatedGroupId) {
                // You could refresh data here if needed
                setShowEditGroupModal(false);
              }
            }}
            existingGroup={group}
          />
        </Modal>
      )}
    </div>
  );
}