"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Logout() {
  const [isLoggedOut, setIsLoggedOut] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Perform logout logic with our auth utility
    const logoutUser = async () => {
      try {
        // Import the auth utility here to avoid SSR issues
        const { auth } = await import('@/utils/auth');
        
        // Call logout method
        await auth.logout();
        
        // Set state to show success message
        setIsLoggedOut(true);
        
        // Redirect to home page after a delay
        setTimeout(() => {
          router.push('/');
        }, 3000);
      } catch (error) {
        console.error('Error during logout:', error);
        // Even if there's an error, we'll still redirect the user
        router.push('/');
      }
    };

    logoutUser();
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white/80 dark:bg-black/80 backdrop-blur-md w-full border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link href="/" className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8h1a4 4 0 0 1 0 8h-1"></path>
              <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path>
              <line x1="6" y1="1" x2="6" y2="4"></line>
              <line x1="10" y1="1" x2="10" y2="4"></line>
              <line x1="14" y1="1" x2="14" y2="4"></line>
            </svg>
            <span className="ml-2 font-semibold text-gray-900 dark:text-white text-lg">Workout Tracker</span>
          </Link>
        </div>
      </header>

      {/* Logout Message */}
      <main className="flex-grow flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-8 md:p-10 text-center">
          {!isLoggedOut ? (
            <div className="space-y-4">
              <div className="flex justify-center">
                <svg className="animate-spin h-12 w-12 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
              <h1 className="text-3xl font-semibold text-gray-900 dark:text-white">Signing Out...</h1>
              <p className="text-gray-600 dark:text-gray-400">Please wait while we securely log you out.</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex justify-center">
                <div className="h-16 w-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <h1 className="text-3xl font-semibold text-gray-900 dark:text-white">You've Been Logged Out</h1>
              <p className="text-gray-600 dark:text-gray-400">Thanks for using Workout Discipline Tracker. You've been successfully signed out.</p>
              <div className="flex flex-col space-y-3 pt-4">
                <p className="text-gray-500 text-sm">Redirecting to home page...</p>
                <Link href="/login" className="inline-block bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 px-6 rounded-lg transition-colors text-center">
                  Sign In Again
                </Link>
                <Link href="/" className="inline-block text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium transition-colors text-center">
                  Go to Home
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4">
          <p className="text-center text-sm text-gray-500">
            © {new Date().getFullYear()} Workout Discipline Tracker. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
