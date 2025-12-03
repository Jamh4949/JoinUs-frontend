import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

/**
 * Interface representing a user in the authentication context.
 * @interface User
 */
export interface User {
  /** Unique user ID */
  uid: string;
  /** User's email address */
  email: string;
  /** User's first name (optional) */
  firstName?: string;
  /** User's last name (optional) */
  lastName?: string;
  /** User's age (optional) */
  age?: number;
  /** User's display name (optional) */
  name?: string;
  /** User's profile photo URL (optional) */
  photo?: string;
  /** Authentication token */
  token: string;
  /** Whether the user has a password set (optional) */
  hasPassword?: boolean;
}

/**
 * Interface for the authentication context value.
 * @interface AuthContextType
 */
interface AuthContextType {
  /** The current authenticated user or null */
  user: User | null;
  /** Boolean indicating if a user is authenticated */
  isAuthenticated: boolean;
  /** Function to log in a user */
  login: (userData: User) => void;
  /** Function to log out the current user */
  logout: () => void;
  /** Function to update user data */
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Provider component for authentication context.
 * Manages user state and persistence in localStorage.
 * 
 * @component
 * @param {AuthProviderProps} props - Component props
 * @returns {JSX.Element} AuthContext Provider
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('user');
      }
    }
  }, []);

  /**
   * Logs in a user and saves to localStorage.
   * @param {User} userData - The user data to set.
   */
  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  /**
   * Logs out the current user and clears localStorage.
   */
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  /**
   * Updates the current user's data.
   * @param {Partial<User>} userData - The partial user data to update.
   */
  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Custom hook to access the authentication context.
 * @returns {AuthContextType} The authentication context value.
 * @throws {Error} If used outside of an AuthProvider.
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
