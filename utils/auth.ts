// This is a simple authentication utility for demo purposes
// In a real application, you would use a more robust authentication system
// like NextAuth.js, Auth0, or a custom solution with proper JWT handling

interface User {
  id: string;
  name: string;
  email: string;
}

export const auth = {
  // Check if user is logged in (in a real app, this would verify the token)
  isLoggedIn: (): boolean => {
    if (typeof window === 'undefined') return false;
    
    const token = localStorage.getItem('auth_token');
    return !!token;
  },
  
  // Get current user data (in a real app, this would decode the JWT or fetch from API)
  getUser: (): User | null => {
    if (typeof window === 'undefined') return null;
    
    const userData = localStorage.getItem('user_data');
    if (!userData) return null;
    
    try {
      return JSON.parse(userData) as User;
    } catch (error) {
      console.error('Failed to parse user data', error);
      return null;
    }
  },
  
  // Login function (in a real app, this would call your API)
  login: async (email: string, password: string): Promise<boolean> => {
    // Mock API call
    return new Promise((resolve) => {
      setTimeout(() => {
        // In a real app, validate credentials with your API
        const mockUser = {
          id: '123',
          name: 'Demo User',
          email: email,
        };
        
        // Store auth data
        localStorage.setItem('auth_token', 'mock_jwt_token');
        localStorage.setItem('user_data', JSON.stringify(mockUser));
        
        resolve(true);
      }, 1000);
    });
  },
  
  // Register function (in a real app, this would call your API)
  register: async (name: string, email: string, password: string): Promise<boolean> => {
    // Mock API call
    return new Promise((resolve) => {
      setTimeout(() => {
        // In a real app, send registration data to your API
        const mockUser = {
          id: '123',
          name: name,
          email: email,
        };
        
        // Store auth data
        localStorage.setItem('auth_token', 'mock_jwt_token');
        localStorage.setItem('user_data', JSON.stringify(mockUser));
        
        resolve(true);
      }, 1000);
    });
  },
  
  // Logout function
  logout: async (): Promise<void> => {
    // In a real app, you might need to invalidate the token on the server
    return new Promise((resolve) => {
      setTimeout(() => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
        resolve();
      }, 500);
    });
  }
};
