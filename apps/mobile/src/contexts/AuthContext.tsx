import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
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
  const checkProfessionalAccount = async (): Promise<boolean> => {
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
  };

  // Refresh account status (professional account and current mode)
  const refreshAccountStatus = async () => {
    if (!user) return;
    
    await checkProfessionalAccount();
    const mode = await getCurrentAccountMode();
    setCurrentMode(mode);
  };

  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      
      if (currentUser) {
        // Load saved mode and check professional account
        const mode = await getCurrentAccountMode();
        setCurrentMode(mode);
        await checkProfessionalAccount();
      }
    };

    fetchSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      
      if (currentUser) {
        const mode = await getCurrentAccountMode();
        setCurrentMode(mode);
        await checkProfessionalAccount();
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

  const register = async (formData: RegisterSchema) => {
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
  };

  const sendPasswordResetEmail = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: '' // Your password reset page URL
    });
    if (error) {
      throw error;
    }
  };

  const switchMode = async (mode: AccountMode) => {
    try {
      // If switching to professional mode, verify they have a professional account
      if (mode === 'professional' && !hasProfessionalAccount) {
        throw new Error('No professional account found. Please create one first.');
      }
      
      await setCurrentAccountMode(mode);
      setCurrentMode(mode);
    } catch (error) {
      console.error('Error switching mode:', error);
      throw error;
    }
  };

  const logout = async () => {
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
  };

  // Can switch mode if user has professional account
  const canSwitchMode = hasProfessionalAccount;

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
