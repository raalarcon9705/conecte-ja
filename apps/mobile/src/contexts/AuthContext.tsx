import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { RegisterSchema } from '@conecteja/schemas';
import { useSupabase } from '../hooks/useSupabase';
import { 
  AccountMode, 
  getCurrentAccountMode, 
  setCurrentAccountMode,
  resetAccountMode 
} from '@conecteja/supabase';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
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
  const supabase = useSupabase();

  // Check if user has a professional account
  // NOTE: With the new business rule, ALL users have professional profiles by default
  // This check should always return true for authenticated users
  const checkProfessionalAccount = useCallback(async (): Promise<boolean> => {
    try {
      if (!user) return false;
      
      const { data, error } = await supabase
        .from('professional_profiles')
        .select('id')
        .eq('profile_id', user.id)
        .single();

      const hasProfessional = !error && !!data;
      setHasProfessionalAccount(hasProfessional);
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
        // Load saved mode and check professional account
        const mode = await getCurrentAccountMode();
        setCurrentMode(mode);
        
        // Check professional account
        const { data, error } = await supabase
          .from('professional_profiles')
          .select('id')
          .eq('profile_id', currentUser.id)
          .single();
        
        const hasProfessional = !error && !!data;
        setHasProfessionalAccount(hasProfessional);
      }
    };

    fetchSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      
      if (currentUser) {
        const mode = await getCurrentAccountMode();
        setCurrentMode(mode);
        
        // Check professional account
        const { data, error } = await supabase
          .from('professional_profiles')
          .select('id')
          .eq('profile_id', currentUser.id)
          .single();
        
        const hasProfessional = !error && !!data;
        setHasProfessionalAccount(hasProfessional);
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
        user,
        isAuthenticated: !!user,
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
