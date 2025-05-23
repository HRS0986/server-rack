'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useServerContext } from '../context/ServerContext';
import { useServerGroupContext } from '../context/ServerGroupContext';
import { useAuth } from '../context/AuthContext';
import Image from 'next/image';
import Button from './Button';
import ServerCard from './ServerCard';
import ServerForm from './ServerForm';
import ServerGroup from './ServerGroup';
import ServerGroupForm from './ServerGroupForm';
import Modal from './Modal';
import LoadingSpinner from './LoadingSpinner';
import Navbar from './Navbar';

export default function HomeContent() {
  const { servers, isLoaded } = useServerContext();
  const { serverGroups, isLoaded: groupsLoaded } = useServerGroupContext();
  const { user, isLoading: authLoading } = useAuth();
  const [isAddingServer, setIsAddingServer] = useState(false);
  const [isAddingServerGroup, setIsAddingServerGroup] = useState(false);
  const [activeTab, setActiveTab] = useState('groups'); // 'servers' or 'groups'
  const router = useRouter();
  // For debugging
  useEffect(() => {
    console.log('HomeContent rendered with servers:', servers);
    console.log('HomeContent rendered with server groups:', serverGroups);
  }, [servers, serverGroups]);

  // Check if this is the first visit
  useEffect(() => {
    const isFirstVisit = localStorage.getItem('firstVisit') !== 'false';
    if (isFirstVisit) {
      localStorage.setItem('firstVisit', 'false');
      router.push('/welcome');
    }
  }, [router]);

  if (authLoading || !isLoaded || !groupsLoaded) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Navbar */}
      <Navbar />      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {user ? (
          <>
            {/* Tabs */}
            <div className="flex border-b border-gray-700 mb-6">
              <button
                onClick={() => setActiveTab('groups')}
                className={`px-4 py-2 text-sm font-medium ${
                  activeTab === 'groups'
                    ? 'border-b-2 border-blue-500 text-blue-500'
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                Server Groups
              </button>
              <button
                onClick={() => setActiveTab('servers')}
                className={`px-4 py-2 text-sm font-medium ${
                  activeTab === 'servers'
                    ? 'border-b-2 border-blue-500 text-blue-500'
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                Servers
              </button>
            </div>

            {/* Servers Tab Content */}
            {activeTab === 'servers' && (
              <>
                {servers.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {servers.map(server => (
                      <ServerCard key={server.ipAddress} server={server} />
                    ))}
                    
                    {/* Add Server Card */}
                    <div className="bg-gray-800 rounded-lg shadow-md p-5 border border-gray-700 flex flex-col justify-center items-center">
                      <div className="mx-auto h-16 w-16 text-gray-500 mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-50">
                          <circle cx="12" cy="12" r="10"></circle>
                          <line x1="12" y1="8" x2="12" y2="16"></line>
                          <line x1="8" y1="12" x2="16" y2="12"></line>
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-gray-200 mb-2">Add a New Server</h3>
                      <p className="text-gray-400 mb-4 text-center">Add another server to your collection</p>
                      <Button onClick={() => setIsAddingServer(true)}>
                        Add Server
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="mx-auto h-24 w-24 text-gray-500 mb-4">
                      <Image 
                        src="/window.svg" 
                        alt="Server illustration" 
                        width={96} 
                        height={96} 
                        className="opacity-50 invert"
                      />
                    </div>
                    <h3 className="text-lg font-medium text-gray-200 mb-1">No servers yet</h3>
                    <p className="text-gray-400 mb-6">Get started by adding your first server</p>
                    <Button onClick={() => setIsAddingServer(true)}>
                      Add Server
                    </Button>
                  </div>
                )}
              </>
            )}
            
            {/* Server Groups Tab Content */}
            {activeTab === 'groups' && (
              <>
                {serverGroups.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {serverGroups.map(group => (
                      <ServerGroup key={group.id} group={group} />
                    ))}
                    
                    {/* Add Server Group Card */}
                    <div className="bg-gray-800 rounded-lg shadow-md p-5 border border-gray-700 flex flex-col justify-center items-center">
                      <div className="mx-auto h-16 w-16 text-gray-500 mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-50">
                          <circle cx="12" cy="12" r="10"></circle>
                          <line x1="12" y1="8" x2="12" y2="16"></line>
                          <line x1="8" y1="12" x2="16" y2="12"></line>
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-gray-200 mb-2">Add a New Server Group</h3>
                      <p className="text-gray-400 mb-4 text-center">Create a group to organize your servers</p>
                      <Button onClick={() => setIsAddingServerGroup(true)}>
                        Add Server Group
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="mx-auto h-24 w-24 text-gray-500 mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-50">
                        <rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect>
                        <rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect>
                        <line x1="6" y1="6" x2="6.01" y2="6"></line>
                        <line x1="6" y1="18" x2="6.01" y2="18"></line>
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-200 mb-1">No server groups yet</h3>
                    <p className="text-gray-400 mb-6">Create groups to organize your servers</p>
                    <Button onClick={() => setIsAddingServerGroup(true)}>
                      Add Server Group
                    </Button>
                  </div>
                )}
              </>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <div className="mx-auto h-24 w-24 text-gray-500 mb-4">
              <Image 
                src="/image.png" 
                alt="Server Rack illustration" 
                width={96} 
                height={96} 
                className="opacity-50 invert"
              />
            </div>
            <h3 className="text-lg font-medium text-gray-200 mb-1">Welcome to Server Rack</h3>
            <p className="text-gray-400 mb-6">Please log in or register to manage your servers</p>
          </div>
        )}
      </main>      {/* Add Server Modal */}
      <Modal
        isOpen={isAddingServer}
        onClose={() => setIsAddingServer(false)}
        title="Add New Server"
      >
        <ServerForm onClose={() => setIsAddingServer(false)} />
      </Modal>
      
      {/* Add Server Group Modal */}
      <Modal
        isOpen={isAddingServerGroup}
        onClose={() => setIsAddingServerGroup(false)}
        title="Add New Server Group"
      >
        <ServerGroupForm onClose={() => setIsAddingServerGroup(false)} />
      </Modal>
    </div>
  );
}
