"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!acceptTerms) {
      setError('You must accept the terms and conditions');
      return;
    }
    
    setIsLoading(true);
    setError('');
    setMessage('');
    
    try {
      // Import the auth utility here to avoid SSR issues
      const { auth } = await import('@/utils/auth');
      
      // Register with magic link
      const result = await auth.register(email, name);
      
      if (result.success) {
        setEmailSent(true);
        setMessage(result.message || 'Registration successful! Check your email for a magic link to log in.');
      } else {
        setError(result.message || 'Failed to register. Please try again.');
      }
      
      setIsLoading(false);
    } catch (error) {
      setError('An error occurred during registration. Please try again.');
      console.error(error);
      setIsLoading(false);
    }
  };

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

      {/* Registration Form */}
      <main className="flex-grow flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-8 md:p-10">
          {emailSent ? (
            <div className="text-center py-8">
              <div className="inline-block h-16 w-16 rounded-full bg-green-100 p-2 flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">Check your email</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8">
                We've sent a magic link to <strong>{email}</strong>. 
                Click the link in the email to complete your registration and sign in.
              </p>
              <button
                onClick={() => setEmailSent(false)}
                className="text-green-600 hover:text-green-500 font-medium"
              >
                Use a different email
              </button>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <h1 className="text-3xl font-semibold text-gray-900 dark:text-white">Create Account</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">Join Workout Discipline Tracker to start your fitness journey.</p>
              </div>
  
              <form onSubmit={handleSubmit}>
                <div className="space-y-5">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Full Name
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="appearance-none block w-full px-3 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200"
                      placeholder="John Doe"
                    />
                  </div>
  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="appearance-none block w-full px-3 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200"
                      placeholder="you@example.com"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      id="terms"
                      name="terms"
                      type="checkbox"
                      checked={acceptTerms}
                      onChange={() => setAcceptTerms(!acceptTerms)}
                      required
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <label htmlFor="terms" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                      I agree to the <a href="#" className="text-green-600 hover:text-green-500">Terms of Service</a> and <a href="#" className="text-green-600 hover:text-green-500">Privacy Policy</a>
                    </label>
                  </div>
  
                  {error && (
                    <div className="rounded-md bg-red-50 p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-red-700">{error}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {message && !error && !emailSent && (
                    <div className="rounded-md bg-green-50 p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-green-700">{message}</p>
                        </div>
                      </div>
                    </div>
                  )}
  
                  <div>
                    <button
                      type="submit"
                      disabled={isLoading || !acceptTerms}
                      className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white 
                        ${acceptTerms && !isLoading ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400 cursor-not-allowed'} 
                        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-200`}
                    >
                      {isLoading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Creating Account...
                        </>
                      ) : (
                        'Create Account'
                      )}
                    </button>
                  </div>
                </div>
              </form>
  
              <p className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
                Already have an account?{' '}
                <Link href="/login" className="font-medium text-green-600 hover:text-green-500">
                  Sign in
                </Link>
              </p>
            </>
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
