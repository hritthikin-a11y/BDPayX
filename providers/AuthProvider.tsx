import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, metadata?: any) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('🚀 Auth Provider initializing...');

    // Get initial session
    const getInitialSession = async () => {
      try {
        console.log('📋 Getting initial session...');
        const { data: { session } } = await supabase.auth.getSession();
        console.log('📋 Initial session result:', session?.user ? 'User found' : 'No user');
        setUser(session?.user ?? null);
      } catch (error) {
        console.error('❌ Error getting initial session:', error);
      } finally {
        console.log('✅ Initial session check completed, setting loading to false');
        setIsLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes with minimal processing
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('🔐 Auth state changed:', event, session?.user?.email || 'No user');
        setUser(session?.user ?? null);
        setIsLoading(false);
        console.log('✅ Auth state processed, loading set to false');
      }
    );

    return () => {
      console.log('🧹 Cleaning up auth provider');
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    console.log('🔑 Attempting sign in for:', email);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('❌ Sign in error:', error.message);
        return { success: false, error: error.message };
      }

      console.log('✅ Sign in successful for:', email);
      return { success: true };
    } catch (error) {
      console.error('❌ Sign in unexpected error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  const signUp = async (email: string, password: string, metadata?: any) => {
    console.log('📝 Attempting sign up for:', email);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      });

      if (error) {
        console.error('❌ Sign up error:', error.message);
        return { success: false, error: error.message };
      }

      console.log('✅ Sign up successful for:', email);
      return { success: true };
    } catch (error) {
      console.error('❌ Sign up unexpected error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  const signOut = async () => {
    console.log('🚪 Signing out...');
    try {
      await supabase.auth.signOut();
      console.log('✅ Sign out successful');
    } catch (error) {
      console.error('❌ Sign out error:', error);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'bdpayx://reset-password',
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Reset password error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  const value = {
    user,
    isLoading,
    signIn,
    signUp,
    signOut,
    resetPassword,
  };

  console.log('🔄 Auth Provider rendering, user:', user?.email || 'None', 'loading:', isLoading);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};