import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { 
  signInWithEmail, 
  signUpWithEmail, 
  signOut, 
  getCurrentUser, 
  getCurrentSession,
  getUserProfile,
  onAuthStateChange
} from '../lib/supabase-enhanced';
import { UserProfile } from '../types';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isLoading: boolean; // alias for loading
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, userData?: Partial<UserProfile>) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUserProfile = async (userId: string) => {
    try {
      const profile = await getUserProfile(userId);
      setUserProfile(profile);
    } catch (error) {
      console.error('Error loading user profile:', error);
      setUserProfile(null);
    }
  };

  const refreshProfile = async () => {
    if (user?.id) {
      await loadUserProfile(user.id);
    }
  };

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const currentSession = await getCurrentSession();
        if (mounted) {
          setSession(currentSession);
          setUser(currentSession?.user || null);
          
          if (currentSession?.user?.id) {
            await loadUserProfile(currentSession.user.id);
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        console.log('Auth state changed:', event, session?.user?.id);
        
        setSession(session);
        setUser(session?.user || null);
        
        if (session?.user?.id) {
          await loadUserProfile(session.user.id);
        } else {
          setUserProfile(null);
        }
        
        setLoading(false);
      }
    );

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const result = await signInWithEmail(email, password);
      
      if (result.error) {
        return { error: result.error.message };
      }

      // Auth state change will handle setting user and profile
      return {};
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Sign in failed' };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, userData?: Partial<UserProfile>) => {
    try {
      setLoading(true);
      const result = await signUpWithEmail(email, password, userData);
      
      if (result.error) {
        return { error: result.error.message };
      }

      // Auth state change will handle setting user and profile
      return {};
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Sign up failed' };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await signOut();
      // Auth state change will handle clearing user and profile
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    session,
    userProfile,
    loading,
    isLoading: loading, // alias for loading
    signIn,
    signUp,
    logout,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;