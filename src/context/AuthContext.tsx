import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppUser } from '../types';

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<AppUser>;
  signup: (email: string, pass: string, name: string) => Promise<AppUser>;
  loginWithGoogle: () => Promise<AppUser>;
  updateProfile: (displayName: string, bio: string, photoURL?: string) => Promise<AppUser>;
  logout: () => void;
  error: string | null;
  setError: (err: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load user session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('collabodraw_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('collabodraw_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, pass: string): Promise<AppUser> => {
    setError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }
      setUser(data.user);
      localStorage.setItem('collabodraw_user', JSON.stringify(data.user));
      return data.user;
    } catch (err: any) {
      setError(err.message || 'Server error during login');
      throw err;
    }
  };

  const signup = async (email: string, pass: string, name: string): Promise<AppUser> => {
    setError(null);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass, displayName: name }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Signup failed');
      }
      setUser(data.user);
      localStorage.setItem('collabodraw_user', JSON.stringify(data.user));
      return data.user;
    } catch (err: any) {
      setError(err.message || 'Server error during signup');
      throw err;
    }
  };

  const loginWithGoogle = async (): Promise<AppUser> => {
    setError(null);
    try {
      // Simulate/trigger a neat Google auth pop-up flow, fallback to mock Google response
      const randName = ['Jordan Sparks', 'Taylor Croft', 'Morgan Dale', 'Riley Stone'][Math.floor(Math.random() * 4)];
      const randEmail = `google_${Math.random().toString(36).substring(2, 7)}@gmail.com`;
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: randEmail,
          displayName: randName,
          photoURL: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(randName)}`,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Google login failed');
      }
      setUser(data.user);
      localStorage.setItem('collabodraw_user', JSON.stringify(data.user));
      return data.user;
    } catch (err: any) {
      setError(err.message || 'Google Auth Error');
      throw err;
    }
  };

  const updateProfile = async (displayName: string, bio: string, photoURL?: string): Promise<AppUser> => {
    if (!user) throw new Error('Not authenticated');
    setError(null);
    try {
      const res = await fetch('/api/users/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: user.uid,
          displayName,
          bio,
          photoURL,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Profile update failed');
      }
      setUser(data.user);
      localStorage.setItem('collabodraw_user', JSON.stringify(data.user));
      return data.user;
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
      throw err;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('collabodraw_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        loginWithGoogle,
        updateProfile,
        logout,
        error,
        setError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
