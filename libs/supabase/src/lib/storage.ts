export const isWeb = typeof localStorage !== 'undefined';

// Platform-specific storage implementation
interface SecureStoreInterface {
  getItemAsync: (key: string) => Promise<string | null>;
  setItemAsync: (key: string, value: string) => Promise<void>;
  deleteItemAsync: (key: string) => Promise<void>;
}

let SecureStore: SecureStoreInterface | undefined;
if (!isWeb) {
  try {
    SecureStore = require('expo-secure-store');
  } catch (error) {
    console.warn('expo-secure-store not available:', error);
  }
}

// Storage adapter for Supabase
export const ExpoSecureStoreAdapter = {
  getItem: (key: string): Promise<string | null> | string | null => {
    if (isWeb) {
      return localStorage.getItem(key);
    } else {
      if (!SecureStore) {
        console.error('SecureStore is not available');
        return Promise.resolve(null);
      }
      return SecureStore.getItemAsync(key);
    }
  },
  setItem: (key: string, value: string): Promise<void> | void => {
    if (isWeb) {
      localStorage.setItem(key, value);
    } else {
      if (!SecureStore) {
        console.error('SecureStore is not available');
        return Promise.resolve();
      }
      return SecureStore.setItemAsync(key, value);
    }
  },
  removeItem: (key: string): Promise<void> | void => {
    if (isWeb) {
      localStorage.removeItem(key);
    } else {
      if (!SecureStore) {
        console.error('SecureStore is not available');
        return Promise.resolve();
      }
      return SecureStore.deleteItemAsync(key);
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
      if (!SecureStore) {
        console.error('SecureStore is not available');
        return false;
      }
      value = await SecureStore.getItemAsync(ONBOARDING_COMPLETED_KEY);
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
    if (isWeb) {
      localStorage.setItem(ONBOARDING_COMPLETED_KEY, 'true');
    } else {
      if (!SecureStore) {
        throw new Error('SecureStore is not available');
      }
      await SecureStore.setItemAsync(ONBOARDING_COMPLETED_KEY, 'true');
    }
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
    if (isWeb) {
      localStorage.removeItem(ONBOARDING_COMPLETED_KEY);
    } else {
      if (!SecureStore) {
        throw new Error('SecureStore is not available');
      }
      await SecureStore.deleteItemAsync(ONBOARDING_COMPLETED_KEY);
    }
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
      if (!SecureStore) {
        console.error('SecureStore is not available');
        return 'client';
      }
      value = await SecureStore.getItemAsync(CURRENT_ACCOUNT_MODE_KEY);
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
    if (isWeb) {
      localStorage.setItem(CURRENT_ACCOUNT_MODE_KEY, mode);
    } else {
      if (!SecureStore) {
        throw new Error('SecureStore is not available');
      }
      await SecureStore.setItemAsync(CURRENT_ACCOUNT_MODE_KEY, mode);
    }
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
    if (isWeb) {
      localStorage.removeItem(CURRENT_ACCOUNT_MODE_KEY);
    } else {
      if (!SecureStore) {
        throw new Error('SecureStore is not available');
      }
      await SecureStore.deleteItemAsync(CURRENT_ACCOUNT_MODE_KEY);
    }
  } catch (error) {
    console.error('Error resetting account mode:', error);
    throw error;
  }
};
