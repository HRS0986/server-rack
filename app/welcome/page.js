'use client';

import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Button from '../components/Button';

export default function WelcomePage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="bg-gray-800 rounded-lg shadow-lg p-6 md:p-8">
          <h1 className="text-3xl font-bold text-white mb-6">Welcome to Server Rack!</h1>
          
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-200 mb-4">Getting Started with Appwrite</h2>
            <p className="text-gray-300 mb-4">
              This application uses Appwrite for authentication and database. Follow these steps to set up your Appwrite account:
            </p>
            
            <div className="space-y-4 mb-6">
              <div className="bg-gray-700 p-4 rounded-lg">
                <h3 className="font-medium text-gray-100 mb-2">Step 1: Create an Appwrite Account</h3>
                <p className="text-gray-300 mb-2">
                  Visit <a href="https://appwrite.io" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Appwrite.io</a> and create an account if you do not have one already.
                </p>
              </div>
              
              <div className="bg-gray-700 p-4 rounded-lg">
                <h3 className="font-medium text-gray-100 mb-2">Step 2: Create a New Project</h3>
                <p className="text-gray-300 mb-2">
                  After logging in, create a new project named Server Rack.
                </p>
              </div>
              
              <div className="bg-gray-700 p-4 rounded-lg">
                <h3 className="font-medium text-gray-100 mb-2">Step 3: Set Up Authentication</h3>
                <p className="text-gray-300 mb-2">
                  Go to the Auth section and configure email/password authentication.
                </p>
              </div>
              
              <div className="bg-gray-700 p-4 rounded-lg">
                <h3 className="font-medium text-gray-100 mb-2">Step 4: Create Database and Collections</h3>
                <p className="text-gray-300 mb-2">
                  Create a database and set up collections for servers and applications following our setup guide.
                </p>
              </div>
              
              <div className="bg-gray-700 p-4 rounded-lg">
                <h3 className="font-medium text-gray-100 mb-2">Step 5: Configure Environment Variables</h3>
                <p className="text-gray-300 mb-2">
                  Update your .env.local file with your Appwrite project details.
                </p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <Link href="/APPWRITE_SETUP.md" target="_blank">
                <Button variant="primary" className="w-full">
                  View Complete Setup Guide
                </Button>
              </Link>
              
              <a href="https://appwrite.io/docs" target="_blank" rel="noopener noreferrer">
                <Button variant="secondary" className="w-full">
                  Appwrite Documentation
                </Button>
              </a>
            </div>
          </div>
          
          <div className="border-t border-gray-700 pt-6">
            <h2 className="text-xl font-semibold text-gray-200 mb-4">Next Steps</h2>
            <p className="text-gray-300 mb-4">
              Once you have set up your Appwrite account, you can:
            </p>
            
            <ul className="list-disc pl-5 text-gray-300 space-y-2 mb-6">
              <li>Register a new account in the application</li>
              <li>Add servers to your dashboard</li>
              <li>Create applications linked to your servers</li>
              <li>Manage servers and applications</li>
            </ul>
            
            <div className="flex flex-col sm:flex-row gap-4">
              {!user ? (
                <>
                  <Link href="/register">
                    <Button className="w-full">
                      Create an Account
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button variant="secondary" className="w-full">
                      Sign In
                    </Button>
                  </Link>
                </>
              ) : (
                <Link href="/">
                  <Button className="w-full">
                    Go to Dashboard
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
