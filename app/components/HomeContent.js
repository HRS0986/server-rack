'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useServerContext } from '../context/ServerContext';
import { useAuth } from '../context/AuthContext';
import Image from 'next/image';
import Button from './Button';
import ServerCard from './ServerCard';
import ServerForm from './ServerForm';
import Modal from './Modal';
import LoadingSpinner from './LoadingSpinner';
import Navbar from './Navbar';

export default function HomeContent() {
  const { servers, isLoaded } = useServerContext();
  const { user, isLoading: authLoading } = useAuth();
  const [isAddingServer, setIsAddingServer] = useState(false);
  const router = useRouter();

  // Check if this is the first visit
  useEffect(() => {
    const isFirstVisit = localStorage.getItem('firstVisit') !== 'false';
    if (isFirstVisit) {
      localStorage.setItem('firstVisit', 'false');
      router.push('/welcome');
    }
  }, [router]);

  if (authLoading || !isLoaded) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Navbar */}
      <Navbar />

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {user ? (
          <>
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
          </>
        ) : (
          <div className="text-center py-12">
            <div className="mx-auto h-24 w-24 text-gray-500 mb-4">
              <Image 
                src="/file.svg" 
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
