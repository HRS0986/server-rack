'use client';

import { useState } from 'react';
import { useServerContext } from '../context/ServerContext';
import Image from 'next/image';
import Button from './Button';
import ServerCard from './ServerCard';
import ServerForm from './ServerForm';
import Modal from './Modal';
import LoadingSpinner from './LoadingSpinner';

export default function HomeContent() {
  const { servers, isLoaded } = useServerContext();
  const [isAddingServer, setIsAddingServer] = useState(false);

  if (!isLoaded) {
    return <LoadingSpinner />;  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 shadow-md border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center">
            <Image 
              src="/file.svg" 
              alt="Server Rack Logo" 
              width={32} 
              height={32} 
              className="mr-2 invert" 
            />
            <h1 className="text-xl font-bold text-gray-100">Server Rack Manager</h1>
          </div>
          <Button onClick={() => setIsAddingServer(true)}>
            Add Server
          </Button>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {servers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {servers.map(server => (
              <ServerCard key={server.id} server={server} />
            ))}
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
      </main>

      {/* Add Server Modal */}
      <Modal
        isOpen={isAddingServer}
        onClose={() => setIsAddingServer(false)}
      >
        <ServerForm onClose={() => setIsAddingServer(false)} />
      </Modal>
    </div>
  );
}
