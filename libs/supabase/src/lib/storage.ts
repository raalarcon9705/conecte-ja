// More reliable web detection
import 'expo-sqlite/localStorage/install';
export const isWeb = typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

// Storage adapter for Supabase
// Supabase auth storage expects all methods to return Promises
// We wrap localStorage in Promises for consistency
export const ExpoSecureStoreAdapter = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      const value = localStorage.getItem(key);
      return value;
    } catch (error) {
      console.error(`[Storage] Error getting item ${key}:`, error);
      return null;
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error(`[Storage] Error setting item ${key}:`, error);
      throw error;
    }
  },
  removeItem: async (key: string): Promise<void> => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`[Storage] Error removing item ${key}:`, error);
      throw error;
    }
  },
};

// Storage keys
const ONBOARDING_COMPLETED_KEY = 'onboarding_completed';
const CURRENT_ACCOUNT_MODE_KEY = 'current_account_mode';

// Types
export type AccountMode = 'client' | 'professional';

/**
 * Check if the user has completed the onboarding
 * @returns Promise<boolean> - true if onboarding was completed, false otherwise
 */
export const hasCompletedOnboarding = async (): Promise<boolean> => {
  try {
    let value: string | null;
    if (isWeb) {
      value = localStorage.getItem(ONBOARDING_COMPLETED_KEY);
    } else {
      value = localStorage.getItem(ONBOARDING_COMPLETED_KEY);
    }
    return value === 'true';
  } catch (error) {
    console.error('Error checking onboarding status:', error);
    return false;
  }
};

/**
 * Mark the onboarding as completed
 * @returns Promise<void>
 */
export const setOnboardingCompleted = async (): Promise<void> => {
  try {
    localStorage.setItem(ONBOARDING_COMPLETED_KEY, 'true');
  } catch (error) {
    console.error('Error setting onboarding status:', error);
    throw error;
  }
};

/**
 * Reset the onboarding status (useful for testing or logout)
 * @returns Promise<void>
 */
export const resetOnboardingStatus = async (): Promise<void> => {
  try {
    localStorage.removeItem(ONBOARDING_COMPLETED_KEY);
  } catch (error) {
    console.error('Error resetting onboarding status:', error);
    throw error;
  }
};

/**
 * Get the current account mode (client or professional)
 * @returns Promise<AccountMode> - current account mode, defaults to 'client' if not set
 */
export const getCurrentAccountMode = async (): Promise<AccountMode> => {
  try {
    let value: string | null;
    if (isWeb) {
      value = localStorage.getItem(CURRENT_ACCOUNT_MODE_KEY);
    } else {
      value = localStorage.getItem(CURRENT_ACCOUNT_MODE_KEY);
    }
    return (value as AccountMode) || 'client';
  } catch (error) {
    console.error('Error getting current account mode:', error);
    return 'client';
  }
};

/**
 * Set the current account mode
 * @param mode - 'client' or 'professional'
 * @returns Promise<void>
 */
export const setCurrentAccountMode = async (mode: AccountMode): Promise<void> => {
  try {
    localStorage.setItem(CURRENT_ACCOUNT_MODE_KEY, mode);
  } catch (error) {
    console.error('Error setting current account mode:', error);
    throw error;
  }
};

/**
 * Reset the account mode (useful for logout)
 * @returns Promise<void>
 */
export const resetAccountMode = async (): Promise<void> => {
  try {
    localStorage.removeItem(CURRENT_ACCOUNT_MODE_KEY);
  } catch (error) {
    console.error('Error resetting account mode:', error);
    throw error;
  }
};
