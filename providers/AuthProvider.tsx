import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { ApiService } from '../lib/api';
import type { User } from '@supabase/supabase-js';
import type { UserProfile } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  userRole: 'USER' | 'ADMIN' | 'SUPER_ADMIN' | null;
  isAdmin: boolean;
  isLoading: boolean;
  profileLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, metadata?: any) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userRole, setUserRole] = useState<'USER' | 'ADMIN' | 'SUPER_ADMIN' | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);

  const isAdmin = userRole === 'ADMIN' || userRole === 'SUPER_ADMIN';

  // Fetch user profile and role
  const fetchUserProfile = async (userId: string) => {
    try {
      setProfileLoading(true);
      console.log('📋 Fetching user profile for:', userId);

      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Profile fetch timeout')), 10000)
      );

      const profilePromise = ApiService.getUserProfile(userId);
      const rolePromise = ApiService.checkUserRole(userId);

      const [profile, role] = await Promise.race([
        Promise.all([profilePromise, rolePromise]),
        timeoutPromise
      ]) as [any, any];

      console.log('📋 Profile result:', profile?.full_name || 'No profile');
      console.log('📋 Role result:', role || 'No role');

      setUserProfile(profile);
      setUserRole((role as 'USER' | 'ADMIN' | 'SUPER_ADMIN') || 'USER');

      // Create profile if it doesn't exist
      if (!profile && userId) {
        console.log('📋 Creating user profile...');
        try {
          const newProfile = await Promise.race([
            ApiService.createUserProfile({
              user_id: userId,
              full_name: user?.user_metadata?.full_name || '',
              phone: user?.user_metadata?.phone || '',
            }),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error('Create profile timeout')), 5000)
            )
          ]);

          if (newProfile) {
            setUserProfile(newProfile as any);
            setUserRole('USER');
          }
        } catch (createError) {
          console.error('❌ Error creating user profile:', createError);
          // Set defaults if profile creation fails
          setUserRole('USER');
        }
      }
    } catch (error) {
      console.error('❌ Error fetching user profile:', error);
      // Set defaults if everything fails
      setUserRole('USER');
      setUserProfile(null);
    } finally {
      setProfileLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (user?.id) {
      await fetchUserProfile(user.id);
    }
  };

  useEffect(() => {
    console.log('🚀 Auth Provider initializing...');

    // Get initial session
    const getInitialSession = async () => {
      try {
        console.log('📋 Getting initial session...');

        // Add timeout to initial session check
        const sessionResult = await Promise.race([
          supabase.auth.getSession(),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Initial session timeout')), 10000)
          )
        ]) as any;

        const { data: { session } } = sessionResult;
        console.log('📋 Initial session result:', session?.user ? 'User found' : 'No user');
        setUser(session?.user ?? null);

        // Set role immediately if user exists, fetch profile in background
        if (session?.user?.id) {
          // Check if this is an admin user (temporary hardcoded check)
          const adminEmails = ['saiketsd23@gmail.com']; // Add your admin emails here
          const isAdminUser = adminEmails.includes(session.user.email || '');

          // Set role immediately based on email check
          const initialRole = isAdminUser ? 'ADMIN' : 'USER';
          setUserRole(initialRole);
          console.log(`🔐 Initial role set: ${initialRole} for ${session.user.email}`);

          // Still try to fetch profile in background for future updates
          fetchUserProfile(session.user.id).catch(error => {
            console.error('❌ Initial background profile fetch failed:', error);
            // Profile fetch failed, but user role is already set based on email
          });
        }
      } catch (error) {
        console.error('❌ Error getting initial session:', error);
        // Set user to null if initial session fails
        setUser(null);
        setUserProfile(null);
        setUserRole(null);
      } finally {
        console.log('✅ Initial session check completed, setting loading to false');
        setIsLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes with minimal processing
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔐 Auth state changed:', event, session?.user?.email || 'No user');
        setUser(session?.user ?? null);

        try {
          if (session?.user?.id) {
            // Check if this is an admin user (temporary hardcoded check)
            const adminEmails = ['saiketsd23@gmail.com']; // Add your admin emails here
            const isAdminUser = adminEmails.includes(session.user.email || '');

            // Set role immediately based on email check
            const initialRole = isAdminUser ? 'ADMIN' : 'USER';
            setUserRole(initialRole);
            console.log(`🔐 Setting initial role: ${initialRole} for ${session.user.email}`);

            // Still try to fetch profile in background for future updates
            fetchUserProfile(session.user.id).catch(error => {
              console.error('❌ Background profile fetch failed:', error);
              // Profile fetch failed, but user role is already set based on email
            });
          } else {
            // Clear profile data on logout
            setUserProfile(null);
            setUserRole(null);
          }
        } catch (error) {
          console.error('❌ Error in auth state change:', error);
          // Set defaults if auth state change fails
          if (session?.user?.id) {
            setUserRole('USER');
          } else {
            setUserProfile(null);
            setUserRole(null);
          }
        }

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
    userProfile,
    userRole,
    isAdmin,
    isLoading,
    profileLoading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    refreshProfile,
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