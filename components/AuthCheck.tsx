"use client";

// Option 1: Import directly from React and Next.js
// This will always work, regardless of your shared imports setup
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

// Option 2: If you want to use shared imports later, do this:
// import { useEffect, useState, useRouter } from '../utils/sharedImports';

export default function AuthCheck({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if the user is authenticated
    const checkAuth = async () => {
      try {
        // Import auth utility client-side to avoid SSR issues
        const { auth } = await import('../utils/auth');
        const isLoggedIn = auth.isLoggedIn();
        
        setIsAuthenticated(isLoggedIn);
        
        if (!isLoggedIn) {
          // Redirect to login if not authenticated
          router.push('/login');
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        setIsAuthenticated(false);
        router.push('/login');
      }
    };
    
    checkAuth();
  }, [router]);

  // Show loading state while checking authentication
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 text-green-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-4 text-lg text-gray-700 dark:text-gray-300">Loading your workout data...</p>
        </div>
      </div>
    );
  }

  // If authenticated, show the children
  return isAuthenticated ? <>{children}</> : null;
}
