import { CompositeNavigationProp, RouteProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

// Root Stack Parameters (todas las screens principales)
export type RootStackParamList = {
  // Auth Screens
  Onboarding: undefined;
  Login: undefined;
  Register: undefined;
  AccountRecovery: undefined;
  RegistrationSuccess: { email?: string };

  // Main Tab Navigator
  MainTabs: undefined;

  // Detail Screens
  ProfessionalDetail: { id: string };
  ChatDetail: { 
    chatId?: string;
    conversationId?: string;
    clientId?: string;
    professionalId?: string;
    professionalName?: string;
    professionalAvatar?: string;
  };
  BookingDetail: { id?: string; bookingId?: string };
  Subscription: undefined;
  Settings: undefined;
  EditProfile: undefined;

  // Job Screens
  JobsList: undefined;
  CreateJob: undefined;
  JobDetail: { jobId: string };
  JobApply: { jobId: string };

  // Tab Screens (for nested navigation)
  Home: undefined;
  Search: undefined;
  Bookings: undefined;
  Chats: undefined;
  Profile: undefined;
};

// Tab Navigator Parameters
export type TabParamList = {
  Home: undefined;
  Search: undefined;
  Bookings: undefined;
  Chats: undefined;
  Profile: undefined;
};

// ============================================
// Navigation Props for Each Screen
// ============================================

// Auth Screens
export type LoginScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Login'
>;
export type RegisterScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Register'
>;
export type OnboardingScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Onboarding'
>;
export type AccountRecoveryScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'AccountRecovery'
>;
export type RegistrationSuccessScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'RegistrationSuccess'
>;

// Tab Screens (usan CompositeNavigationProp para acceder al Stack padre)
export type HomeScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList, 'Home'>,
  NativeStackNavigationProp<RootStackParamList>
>;

export type SearchScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList, 'Search'>,
  NativeStackNavigationProp<RootStackParamList>
>;

export type BookingsScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList, 'Bookings'>,
  NativeStackNavigationProp<RootStackParamList>
>;

export type ChatsScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList, 'Chats'>,
  NativeStackNavigationProp<RootStackParamList>
>;

export type ProfileScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList, 'Profile'>,
  NativeStackNavigationProp<RootStackParamList>
>;

// Detail Screens
export type ProfessionalDetailScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'ProfessionalDetail'
>;

export type ChatDetailScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'ChatDetail'
>;

export type BookingDetailScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'BookingDetail'
>;

export type SubscriptionScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Subscription'
>;

export type SettingsScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Settings'
>;

export type EditProfileScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'EditProfile'
>;

// Job Screens
export type JobsListScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'JobsList'
>;

export type CreateJobScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'CreateJob'
>;

export type JobDetailScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'JobDetail'
>;

export type JobApplyScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'JobApply'
>;

// ============================================
// Route Props for Each Screen
// ============================================

// Auth Screens Routes
export type LoginScreenRouteProp = RouteProp<RootStackParamList, 'Login'>;
export type RegisterScreenRouteProp = RouteProp<RootStackParamList, 'Register'>;
export type OnboardingScreenRouteProp = RouteProp<RootStackParamList, 'Onboarding'>;
export type AccountRecoveryScreenRouteProp = RouteProp<RootStackParamList, 'AccountRecovery'>;
export type RegistrationSuccessScreenRouteProp = RouteProp<RootStackParamList, 'RegistrationSuccess'>;

// Tab Screens Routes
export type HomeScreenRouteProp = RouteProp<TabParamList, 'Home'>;
export type SearchScreenRouteProp = RouteProp<TabParamList, 'Search'>;
export type BookingsScreenRouteProp = RouteProp<TabParamList, 'Bookings'>;
export type ChatsScreenRouteProp = RouteProp<TabParamList, 'Chats'>;
export type ProfileScreenRouteProp = RouteProp<TabParamList, 'Profile'>;

// Detail Screens Routes
export type ProfessionalDetailScreenRouteProp = RouteProp<
  RootStackParamList,
  'ProfessionalDetail'
>;

export type ChatDetailScreenRouteProp = RouteProp<RootStackParamList, 'ChatDetail'>;

export type BookingDetailScreenRouteProp = RouteProp<
  RootStackParamList,
  'BookingDetail'
>;

export type SubscriptionScreenRouteProp = RouteProp<
  RootStackParamList,
  'Subscription'
>;

export type SettingsScreenRouteProp = RouteProp<
  RootStackParamList,
  'Settings'
>;

export type EditProfileScreenRouteProp = RouteProp<
  RootStackParamList,
  'EditProfile'
>;

// Job Screens Routes
export type JobsListScreenRouteProp = RouteProp<RootStackParamList, 'JobsList'>;
export type CreateJobScreenRouteProp = RouteProp<RootStackParamList, 'CreateJob'>;
export type JobDetailScreenRouteProp = RouteProp<RootStackParamList, 'JobDetail'>;
export type JobApplyScreenRouteProp = RouteProp<RootStackParamList, 'JobApply'>;

// ============================================
// Combined Props Interfaces (para facilitar uso)
// ============================================

export interface HomeScreenProps {
  navigation: HomeScreenNavigationProp;
  route: HomeScreenRouteProp;
}

export interface SearchScreenProps {
  navigation: SearchScreenNavigationProp;
  route: SearchScreenRouteProp;
}

export interface BookingsScreenProps {
  navigation: BookingsScreenNavigationProp;
  route: BookingsScreenRouteProp;
}

export interface ChatsScreenProps {
  navigation: ChatsScreenNavigationProp;
  route: ChatsScreenRouteProp;
}

export interface ProfileScreenProps {
  navigation: ProfileScreenNavigationProp;
  route: ProfileScreenRouteProp;
}

export interface ProfessionalDetailScreenProps {
  navigation: ProfessionalDetailScreenNavigationProp;
  route: ProfessionalDetailScreenRouteProp;
}

export interface ChatDetailScreenProps {
  navigation: ChatDetailScreenNavigationProp;
  route: ChatDetailScreenRouteProp;
}

export interface BookingDetailScreenProps {
  navigation: BookingDetailScreenNavigationProp;
  route: BookingDetailScreenRouteProp;
}

export interface JobDetailScreenProps {
  navigation: JobDetailScreenNavigationProp;
  route: JobDetailScreenRouteProp;
}

export interface JobApplyScreenProps {
  navigation: JobApplyScreenNavigationProp;
  route: JobApplyScreenRouteProp;
}

export interface LoginScreenProps {
  navigation: LoginScreenNavigationProp;
  route: LoginScreenRouteProp;
}

export interface RegisterScreenProps {
  navigation: RegisterScreenNavigationProp;
  route: RegisterScreenRouteProp;
}

export interface OnboardingScreenProps {
  navigation: OnboardingScreenNavigationProp;
  route: OnboardingScreenRouteProp;
}

export interface SettingsScreenProps {
  navigation: SettingsScreenNavigationProp;
  route: SettingsScreenRouteProp;
}

export interface EditProfileScreenProps {
  navigation: EditProfileScreenNavigationProp;
  route: EditProfileScreenRouteProp;
}

export interface SubscriptionScreenProps {
  navigation: SubscriptionScreenNavigationProp;
  route: SubscriptionScreenRouteProp;
}

export interface CreateJobScreenProps {
  navigation: CreateJobScreenNavigationProp;
  route: CreateJobScreenRouteProp;
}

export interface JobsListScreenProps {
  navigation: JobsListScreenNavigationProp;
  route: JobsListScreenRouteProp;
}
