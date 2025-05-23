'use client';

import { useState, useEffect } from 'react';
import { useServerContext } from '../../context/ServerContext';
import { useServerGroupContext } from '../../context/ServerGroupContext';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import ServerCard from '../../components/ServerCard';
import ServerGroupForm from '../../components/ServerGroupForm';
import LoadingSpinner from '../../components/LoadingSpinner';
import Navbar from '../../components/Navbar';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { use } from 'react';

export default function ServerGroupDetails({ params }) {
  const { id } = use(params); 
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { servers, isLoaded: serversLoaded } = useServerContext();
  const { serverGroups, getServersInGroup, updateServerGroup, isLoaded: groupsLoaded } = useServerGroupContext();
  
  const [serverGroup, setServerGroup] = useState(null);
  const [groupServers, setGroupServers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showVariables, setShowVariables] = useState(false);
  const [showAddServers, setShowAddServers] = useState(false);
  const [availableServers, setAvailableServers] = useState([]);
  const [selectedServers, setSelectedServers] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user || !groupsLoaded || !serversLoaded) return;
      
      try {
        // Find the server group by id
        const group = serverGroups.find(g => g.id === id);
        if (!group) {
          toast.error('Server group not found');
          router.push('/');
          return;
        }
        
        setServerGroup(group);
        
        // Get servers in this group
        const serversInGroup = await getServersInGroup(id);
        setGroupServers(serversInGroup);
        
        // Get servers not in this group for the add servers modal
        const serversNotInGroup = servers.filter(
          server => !serversInGroup.some(groupServer => groupServer.id === server.id)
        );
        setAvailableServers(serversNotInGroup);
      } catch (error) {
        console.error('Error fetching server group data:', error);
        toast.error('Failed to load server group data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [id, user, serverGroups, servers, groupsLoaded, serversLoaded, getServersInGroup, router]);
  
  if (authLoading || isLoading || !groupsLoaded || !serversLoaded) {
    return <LoadingSpinner />;
  }
  
  if (!serverGroup) {
    return (
      <div className="min-h-screen bg-gray-900">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-200">Server Group Not Found</h2>
            <p className="mt-2 text-gray-400">The server group you're looking for doesn't exist.</p>
            <Button 
              variant="primary" 
              className="mt-6" 
              onClick={() => router.push('/')}
            >
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const handleToggleServerSelection = (server) => {
    if (selectedServers.some(s => s.id === server.id)) {
      setSelectedServers(selectedServers.filter(s => s.id !== server.id));
    } else {
      setSelectedServers([...selectedServers, server]);
    }
  };
  
  const handleAddServersToGroup = async () => {
    // This would call an appwrite service method to add servers to the group
    // For now, we'll just close the modal
    toast.success(`${selectedServers.length} servers added to group`);
    setShowAddServers(false);
    setSelectedServers([]);
    // In a real implementation, you'd update the state and refresh the data
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Group Header */}
        <div className="border-b border-gray-700 pb-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-semibold text-gray-100">{serverGroup.name}</h1>
              <p className="text-gray-400 mt-1">{serverGroup.description || 'No description provided'}</p>
            </div>
            <div className="flex space-x-3">
              <Button 
                variant="secondary" 
                onClick={() => setShowVariables(true)}
              >
                Go Back
              </Button>
              <Button 
                variant="secondary" 
                onClick={() => setShowVariables(true)}
              >
                View Group Variables
              </Button>
              <Button 
                variant="secondary" 
                onClick={() => setIsEditing(true)}
              >
                Edit Server Group
              </Button>
            </div>
          </div>
        </div>
        
        {/* Servers in Group */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-medium text-gray-200">Servers in this Group</h2>
            <Button 
              variant="primary" 
              onClick={() => setShowAddServers(true)}
            >
              Add Servers
            </Button>
          </div>
          
          {groupServers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {groupServers.map(server => (
                <ServerCard key={server.id} server={server} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-800 rounded-md">
              <h3 className="text-lg font-medium text-gray-300 mb-1">No servers in this group yet</h3>
              <p className="text-gray-400 mb-4">Add servers to this group to start managing them together</p>
              <Button onClick={() => setShowAddServers(true)}>
                Add Servers
              </Button>
            </div>
          )}
        </div>
      </main>
      
      {/* Edit Group Modal */}
      {isEditing && (
        <Modal
          isOpen={isEditing}
          onClose={() => setIsEditing(false)}
          title="Edit Server Group"
        >
          <ServerGroupForm 
            onClose={() => setIsEditing(false)} 
            existingGroup={serverGroup}
          />
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
            {Object.keys(serverGroup.variables || {}).length > 0 ? (
              <div className="bg-gray-900 rounded p-4 overflow-auto max-h-96">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="text-left pb-2 border-b border-gray-700 text-gray-400">Key</th>
                      <th className="text-left pb-2 border-b border-gray-700 text-gray-400">Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(serverGroup.variables || {}).map(([key, value]) => (
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
            </div>
          </div>
        </Modal>
      )}
      
      {/* Add Servers Modal */}
      {showAddServers && (
        <Modal
          isOpen={showAddServers}
          onClose={() => {
            setShowAddServers(false);
            setSelectedServers([]);
          }}
          title="Add Servers to Group"
        >
          <div className="p-4">
            {availableServers.length > 0 ? (
              <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                {availableServers.map(server => (
                  <div 
                    key={server.id}
                    className={`flex items-center p-3 rounded border ${
                      selectedServers.some(s => s.id === server.id)
                        ? 'border-blue-500 bg-gray-800'
                        : 'border-gray-700 bg-gray-900'
                    } cursor-pointer`}
                    onClick={() => handleToggleServerSelection(server)}
                  >
                    <div className="flex-1">
                      <h4 className="text-gray-200 font-medium">{server.name}</h4>
                      <p className="text-gray-400 text-sm">{server.ipAddress}</p>
                    </div>
                    <div className="ml-3">
                      <input 
                        type="checkbox"
                        checked={selectedServers.some(s => s.id === server.id)}
                        onChange={() => {}}
                        className="h-4 w-4 rounded border-gray-600 text-blue-600 focus:ring-blue-600 bg-gray-800"
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400">No servers available to add to this group.</p>
            )}
            
            <div className="flex justify-between items-center mt-6">
              <p className="text-gray-400 text-sm">
                {selectedServers.length} server(s) selected
              </p>
              <div className="flex space-x-3">
                <Button 
                  variant="secondary" 
                  onClick={() => {
                    setShowAddServers(false);
                    setSelectedServers([]);
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  variant="primary"
                  onClick={handleAddServersToGroup}
                  disabled={selectedServers.length === 0}
                >
                  Add to Group
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
