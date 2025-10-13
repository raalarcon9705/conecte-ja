/** @jsxImportSource nativewind */
import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import {
  Screen,
  Text,
  Avatar,
  Card,
  Button,
  Container,
  Spacer,
  Divider,
  StatCard,
  Badge,
} from '@conecteja/ui-mobile';
import {
  Check,
  Pencil,
  Star,
  Heart,
  Settings,
  HelpCircle,
  LogOut,
  Eye,
  MessageSquare,
  ChevronRight,
} from 'lucide-react-native';

import { useAuth } from '../../contexts/AuthContext';
import { useProfile } from '../../contexts/ProfileContext';
import { useSubscriptions } from '../../contexts/SubscriptionsContext';

export default function ProfileScreen({ navigation }: any) {
  const { t } = useTranslation();
  const { user, logout, currentMode, hasProfessionalAccount } = useAuth();
  const { profile, loading: profileLoading, fetchProfile } = useProfile();
  const { currentSubscription, fetchCurrentSubscription } = useSubscriptions();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchProfile(user.id);
      fetchCurrentSubscription(user.id);
    }
  }, [user]);

  const isProfessional = hasProfessionalAccount;

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      // The onAuthStateChange listener in AuthContext will handle navigation
    } catch (error) {
      console.error('Logout error in ProfileScreen:', error);
      Alert.alert(
        t('settings.logout.error.title') || 'Error',
        t('settings.logout.error.message') || 'Failed to logout. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoggingOut(false);
    }
  };

  const profileMenuItems = [
    { id: 'edit', icon: Pencil, label: t('profile.menu.editProfile'), screen: 'EditProfile' },
    { id: 'subscription', icon: Star, label: t('profile.menu.subscription'), screen: 'Subscription' },
    { id: 'favorites', icon: Heart, label: t('profile.menu.favorites'), screen: 'Favorites' },
    { id: 'settings', icon: Settings, label: t('profile.menu.settings'), screen: 'Settings' },
    { id: 'help', icon: HelpCircle, label: t('profile.menu.help'), screen: 'Help' },
    { id: 'logout', icon: LogOut, label: isLoggingOut ? (t('settings.logout.processing') || 'Logging out...') : t('profile.menu.logout'), screen: null },
  ];

  if (profileLoading && !profile) {
    return (
      <Screen safe className="bg-gray-50">
        <Container className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3B82F6" />
        </Container>
      </Screen>
    );
  }

  const userName = profile?.full_name || user?.user_metadata?.full_name || 'Usuario';
  const userEmail = user?.email || 'email@example.com';
  const avatarUrl = profile?.avatar_url;
  const isVerified = profile?.is_verified || false;

  // Get subscription plan name
  const planName = currentSubscription?.subscription_plan?.name || t('profile.freePlan');

  return (
    <Screen safe scrollable className="bg-gray-50">
      <Container>
        <View className="items-center py-8">
          <Avatar
            name={userName}
            size="xl"
            uri={avatarUrl}
            badge={
              isVerified ? (
                <View className="w-8 h-8 bg-blue-500 rounded-full items-center justify-center border-2 border-white">
                  <Check size={18} color="white" />
                </View>
              ) : undefined
            }
          />
          <Spacer size="md" />
          <Text variant="h3" weight="bold">
            {userName}
          </Text>
          <Text variant="body" color="muted">
            {userEmail}
          </Text>
          <Spacer size="sm" />
          <Badge variant="primary">{planName}</Badge>
        </View>

        {isProfessional && profile?.professional_profile && (
          <>
            <Text variant="h4" weight="bold" className="mb-4">
              {t('profile.statistics')}
            </Text>
            <View className="flex-row gap-2 mb-6">
              <StatCard
                icon={<Eye size={24} className="text-gray-600" />}
                label={t('profile.stats.visits')}
                value={String(profile.professional_profile.profile_views || 0)}
                trend={profile.professional_profile.profile_views && profile.professional_profile.profile_views > 0 
                  ? { value: 12, isPositive: true } 
                  : undefined}
              />
              <StatCard
                icon={<MessageSquare size={24} className="text-gray-600" />}
                label={t('profile.stats.contacts')}
                value={String(profile.professional_profile.weekly_contacts_used || 0)}
                trend={profile.professional_profile.weekly_contacts_used && profile.professional_profile.weekly_contacts_used > 0 
                  ? { value: 5, isPositive: true } 
                  : undefined}
              />
            </View>
          </>
        )}

        <Card variant="outlined" padding="none">
          {profileMenuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <React.Fragment key={item.id}>
                <TouchableOpacity
                  className="flex-row items-center p-4 active:bg-gray-50"
                  disabled={item.id === 'logout' && isLoggingOut}
                  onPress={() => {
                    if (item.screen) {
                      navigation.navigate(item.screen);
                    } else if (item.id === 'logout') {
                      handleLogout();
                    }
                  }}
                >
                  <Icon size={22} className="mr-4 text-gray-700" />
                  <Text variant="body" weight="medium" className="flex-1">
                    {item.label}
                  </Text>
                  <ChevronRight size={20} className="text-gray-400" />
                </TouchableOpacity>
                {index < profileMenuItems.length - 1 && <Divider spacing="none" />}
              </React.Fragment>
            );
          })}
        </Card>

        <Spacer size="lg" />

        <Button variant="outline" fullWidth onPress={() => navigation.navigate('Subscription')}>
          <View className="flex-row items-center">
            <Star size={16} className="mr-2 text-yellow-500" />
            <Text>{t('profile.upgradeToPremium')}</Text>
          </View>
        </Button>

        <Spacer size="md" />

        <Text variant="caption" color="muted" align="center">
          {t('app.version')}
        </Text>
      </Container>
    </Screen>
  );
}
