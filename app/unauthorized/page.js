'use client';

import Link from 'next/link';
import Image from 'next/image';
import Button from '../components/Button';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 bg-gray-900">
      <div className="w-full max-w-md text-center">
        <Image
          src="/file.svg"
          alt="Server Rack Logo"
          width={64}
          height={64}
          className="mx-auto mb-6 invert"
        />
        
        <h1 className="text-3xl font-bold mb-4 text-gray-100">Access Denied</h1>
        
        <p className="text-gray-300 mb-8">
          You do not have permission to access this page. Please log in or register to continue.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link href="/login">
            <Button variant="secondary" className="w-full">
              Sign In
            </Button>
          </Link>
          
          <Link href="/register">
            <Button className="w-full">
              Create Account
            </Button>
          </Link>
        </div>
        
        <Link href="/" className="mt-8 inline-block text-blue-400 hover:text-blue-300">
          Back to Home
        </Link>
      </div>
    </div>
  );
}
