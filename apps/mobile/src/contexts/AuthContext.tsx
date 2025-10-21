/** @jsxImportSource nativewind */
import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { User } from '@supabase/supabase-js';
import { RegisterSchema } from '@conecteja/schemas';
import { useSupabase } from '../hooks/useSupabase';
import {
  AccountMode,
  getCurrentAccountMode,
  setCurrentAccountMode,
  resetAccountMode
} from '@conecteja/supabase';
import { ProfessionalProfile } from './JobPostingsContext';

interface AuthContextType {
  user: User | null;
  professionalProfile: ProfessionalProfile | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  currentMode: AccountMode;
  hasProfessionalAccount: boolean;
  canSwitchMode: boolean;
  login: (user: User) => void;
  logout: () => Promise<void>;
  register: (data: RegisterSchema) => Promise<void>;
  sendPasswordResetEmail: (email: string) => Promise<void>;
  switchMode: (mode: AccountMode) => Promise<void>;
  checkProfessionalAccount: () => Promise<boolean>;
  refreshAccountStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [currentMode, setCurrentMode] = useState<AccountMode>('client');
  const [hasProfessionalAccount, setHasProfessionalAccount] = useState(false);
  const [professionalProfile, setProfessionalProfile] = useState<ProfessionalProfile | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const supabase = useSupabase();

  // Check if user has a professional account
  // NOTE: With the new business rule, ALL users have professional profiles by default
  // This check should always return true for authenticated users
  const checkProfessionalAccount = useCallback(async (): Promise<boolean> => {
    try {
      if (!user) return false;

      const { data, error } = await supabase
        .from('professional_profiles')
        .select('*')
        .eq('profile_id', user.id)
        .single();

      const hasProfessional = !error && !!data;
      setHasProfessionalAccount(hasProfessional);
      if (data) {
        setProfessionalProfile(data);
      }
      return hasProfessional;
    } catch (error) {
      console.error('Error checking professional account:', error);
      return false;
    }
  }, [user, supabase]);

  // Refresh account status (professional account and current mode)
  const refreshAccountStatus = useCallback(async () => {
    if (!user) return;

    await checkProfessionalAccount();
    const mode = await getCurrentAccountMode();
    setCurrentMode(mode);
  }, [user, checkProfessionalAccount]);

  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        try {
          // Load saved mode and check professional account
          const mode = await getCurrentAccountMode();
          setCurrentMode(mode);

          // Add timeout to detect hanging queries
          const queryPromise = supabase
            .from('professional_profiles')
            .select('id')
            .eq('profile_id', currentUser.id)
            .single();

          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Query timeout after 10 seconds')), 10000)
          );

          let data: unknown;
          let error: unknown;
          try {
            const result = await Promise.race([queryPromise, timeoutPromise]);
            const queryResult = result as { data: unknown; error: unknown };
            data = queryResult.data;
            error = queryResult.error;
          } catch (timeoutError) {
            console.error('[AuthContext] ⏱️ Query timed out:', timeoutError);
            error = timeoutError;
          }

          const hasProfessional = !error && !!data;
          setHasProfessionalAccount(hasProfessional);
        } catch (error) {
          console.error('[AuthContext] ❌ Error in fetchSession setup:', error);
        }
      }

      // Mark as initialized after first session check
      setIsInitialized(true);
    };

    fetchSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        try {
          const mode = await getCurrentAccountMode();
          setCurrentMode(mode);

          // Add timeout to detect hanging queries
          const queryPromise = supabase
            .from('professional_profiles')
            .select('id')
            .eq('profile_id', currentUser.id)
            .single();

          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Query timeout after 1 second')), 1000)
          );

          let data: unknown;
          let error: unknown;
          try {
            const result = await Promise.race([queryPromise, timeoutPromise]);
            const queryResult = result as { data: unknown; error: unknown };
            data = queryResult.data;
            error = queryResult.error;
          } catch (timeoutError) {
            error = timeoutError;
          }


          const hasProfessional = !error && !!data;
          setHasProfessionalAccount(hasProfessional);
        } catch (error) {
          console.error('[AuthContext] ❌ Error during account setup:', error);
        }
      } else {
        setCurrentMode('client');
        setHasProfessionalAccount(false);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase]);

  const login = (newUser: User) => {
    setUser(newUser);
  };

  const register = useCallback(async (formData: RegisterSchema) => {
    const { error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          full_name: formData.name,
          user_type: formData.userType,
        },
      },
    });

    if (error) {
      throw error;
    }
  }, [supabase]);

  const sendPasswordResetEmail = useCallback(async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: '' // Your password reset page URL
    });
    if (error) {
      throw error;
    }
  }, [supabase]);

  const switchMode = useCallback(async (mode: AccountMode) => {
    try {
      // With the new business rule, all users have both profiles
      // So we can switch modes freely without checking
      await setCurrentAccountMode(mode);
      setCurrentMode(mode);
    } catch (error) {
      console.error('Error switching mode:', error);
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error during logout:', error);
        throw error;
      }
      setUser(null);
      setCurrentMode('client');
      setHasProfessionalAccount(false);
      await resetAccountMode();
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  }, [supabase]);

  // With the new business rule, all authenticated users can switch modes
  // because they all have both client and professional profiles
  const canSwitchMode = !!user;

  return (
    <AuthContext.Provider
      value={{
        professionalProfile,
        user,
        isAuthenticated: !!user,
        isInitialized,
        currentMode,
        hasProfessionalAccount,
        canSwitchMode,
        login,
        logout,
        register,
        sendPasswordResetEmail,
        switchMode,
        checkProfessionalAccount,
        refreshAccountStatus,
      }}
    >
      {/* Show loading screen while initializing, then render children */}
      {isInitialized ? (
        children
      ) : (
        <View className="flex-1 items-center justify-center bg-white">
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      )}
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
