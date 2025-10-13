/** @jsxImportSource nativewind */
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Home, Search, Calendar, MessageCircle, User } from 'lucide-react-native';
import '../i18n';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { CategoriesProvider } from '../contexts/CategoriesContext';
import { ProfessionalsProvider } from '../contexts/ProfessionalsContext';
import { ChatsProvider } from '../contexts/ChatsContext';
import { BookingsProvider } from '../contexts/BookingsContext';
import { FavoritesProvider } from '../contexts/FavoritesContext';
import { NotificationsProvider } from '../contexts/NotificationsContext';
import { SubscriptionsProvider } from '../contexts/SubscriptionsContext';
import { ProfileProvider } from '../contexts/ProfileContext';
import { hasCompletedOnboarding } from '@conecteja/supabase';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import OnboardingScreen from '../screens/auth/OnboardingScreen';
import AccountRecoveryScreen from '../screens/auth/AccountRecoveryScreen';
import RegistrationSuccessScreen from '../screens/auth/RegistrationSuccessScreen';

// Main Tab Screens
import HomeScreen from '../screens/home/HomeScreen';
import SearchScreen from '../screens/home/SearchScreen';
import BookingsScreen from '../screens/bookings/BookingsScreen';
import ChatsScreen from '../screens/chat/ChatsScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

// Detail Screens
import ProfessionalDetailScreen from '../screens/professional/ProfessionalDetailScreen';
import ChatDetailScreen from '../screens/chat/ChatDetailScreen';
import BookingDetailScreen from '../screens/bookings/BookingDetailScreen';
import SubscriptionScreen from '../screens/premium/SubscriptionScreen';
import SettingsScreen from '../screens/settings/SettingsScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';

// Job Screens
import JobsListScreen from '../screens/jobs/JobsListScreen';
import CreateJobScreen from '../screens/jobs/CreateJobScreen';
import JobDetailScreen from '../screens/jobs/JobDetailScreen';
import JobApplyScreen from '../screens/jobs/JobApplyScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Tabs Navigator
function MainTabs() {
  const { t } = useTranslation();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#3b82f6',
        tabBarInactiveTintColor: '#9ca3af',
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: t('navigation.home'),
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{
          tabBarLabel: t('navigation.search'),
          tabBarIcon: ({ color, size }) => <Search size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Bookings"
        component={BookingsScreen}
        options={{
          tabBarLabel: t('navigation.bookings'),
          tabBarIcon: ({ color, size }) => <Calendar size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Chats"
        component={ChatsScreen}
        options={{
          tabBarLabel: t('navigation.chats'),
          tabBarIcon: ({ color, size }) => <MessageCircle size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: t('navigation.profile'),
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}

function AppNavigator() {
  const { isAuthenticated } = useAuth();
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        const completed = await hasCompletedOnboarding();
        setOnboardingCompleted(completed);
      } catch (error) {
        console.error('Error checking onboarding status:', error);
        setOnboardingCompleted(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkOnboardingStatus();
  }, []);

  // Show loading state while checking onboarding status
  if (isLoading) {
    return null; // Or a loading screen component
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <>
            {!onboardingCompleted && (
              <Stack.Screen 
                name="Onboarding" 
                component={OnboardingScreen}
                options={{ gestureEnabled: false }}
              />
            )}
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="AccountRecovery" component={AccountRecoveryScreen} />
            <Stack.Screen name="RegistrationSuccess" component={RegistrationSuccessScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="MainTabs" component={MainTabs} />
            <Stack.Screen name="ProfessionalDetail" component={ProfessionalDetailScreen} />
            <Stack.Screen name="ChatDetail" component={ChatDetailScreen} />
            <Stack.Screen name="BookingDetail" component={BookingDetailScreen} />
            <Stack.Screen name="Subscription" component={SubscriptionScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="EditProfile" component={EditProfileScreen} />

            {/* Job Posting Screens */}
            <Stack.Screen name="JobsList" component={JobsListScreen} />
            <Stack.Screen name="CreateJob" component={CreateJobScreen} />
            <Stack.Screen name="JobDetail" component={JobDetailScreen} />
            <Stack.Screen name="JobApply" component={JobApplyScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <ProfileProvider>
          <CategoriesProvider>
            <ProfessionalsProvider>
              <SubscriptionsProvider>
                <BookingsProvider>
                  <ChatsProvider>
                    <FavoritesProvider>
                      <NotificationsProvider>
                        <AppNavigator />
                      </NotificationsProvider>
                    </FavoritesProvider>
                  </ChatsProvider>
                </BookingsProvider>
              </SubscriptionsProvider>
            </ProfessionalsProvider>
          </CategoriesProvider>
        </ProfileProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
