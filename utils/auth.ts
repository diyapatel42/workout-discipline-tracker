import { supabase } from './supabase';

interface User {
  id: string;
  email?: string;
  user_metadata?: {
    name?: string;
  };
}

export const auth = {
  // Check if user is logged in
  isLoggedIn: async (): Promise<boolean> => {
    if (typeof window === 'undefined') return false;
    
    const { data: { session } } = await supabase.auth.getSession();
    return !!session;
  },
  
  // Get current user data
  getUser: async (): Promise<User | null> => {
    if (typeof window === 'undefined') return null;
    
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },
  
  // Send magic link for authentication
  sendMagicLink: async (email: string, redirectTo?: string): Promise<{ success: boolean; message?: string }> => {
    try {
      // Default redirect to the app's login page if not specified
      const finalRedirectTo = redirectTo || `${window.location.origin}/login`;
      
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: finalRedirectTo,
        }
      });
      
      if (error) {
        console.error('Magic link error:', error.message);
        return { 
          success: false, 
          message: error.message 
        };
      }
      
      return { 
        success: true,
        message: 'Magic link sent! Check your email inbox.'
      };
    } catch (error) {
      console.error('Unexpected magic link error:', error);
      return { 
        success: false, 
        message: 'An unexpected error occurred. Please try again.' 
      };
    }
  },
  
  // Register a new user with magic link
  register: async (email: string, name: string): Promise<{ success: boolean; message?: string }> => {
    try {
      // For magic link registration, we'll just store the name in user metadata
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          data: { name },
          emailRedirectTo: `${window.location.origin}/login`,
        }
      });
      
      if (error) {
        console.error('Registration error:', error.message);
        return { 
          success: false, 
          message: error.message 
        };
      }
      
      return { 
        success: true,
        message: 'Registration successful! Check your email inbox for a magic link.'
      };
    } catch (error) {
      console.error('Unexpected registration error:', error);
      return { 
        success: false, 
        message: 'An unexpected error occurred during registration. Please try again.' 
      };
    }
  },
  
  // Handle authentication after receiving magic link
  handleAuthFromUrl: async (): Promise<boolean> => {
    try {
      // This will parse the URL hash and attempt to exchange the OTP for a session
      const { error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error handling auth from URL:', error.message);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Unexpected error handling auth from URL:', error);
      return false;
    }
  },
  
  // Logout function
  logout: async (): Promise<void> => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout error:', error.message);
      }
    } catch (error) {
      console.error('Unexpected logout error:', error);
    }
  }
};
