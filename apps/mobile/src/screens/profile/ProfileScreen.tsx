/** @jsxImportSource nativewind */
import React from 'react';
import { View, TouchableOpacity, ScrollView } from 'react-native';
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

export default function ProfileScreen({ navigation }: any) {
  const { t } = useTranslation();
  const isProfessional = false; // TODO: Get from state

  const profileMenuItems = [
    { id: 'edit', icon: '✏️', label: t('profile.menu.editProfile'), screen: 'EditProfile' },
    { id: 'subscription', icon: '⭐', label: t('profile.menu.subscription'), screen: 'Subscription' },
    { id: 'favorites', icon: '❤️', label: t('profile.menu.favorites'), screen: 'Favorites' },
    { id: 'settings', icon: '⚙️', label: t('profile.menu.settings'), screen: 'Settings' },
    { id: 'help', icon: '❓', label: t('profile.menu.help'), screen: 'Help' },
    { id: 'logout', icon: '🚪', label: t('profile.menu.logout'), screen: null },
  ];

  return (
    <Screen safe scrollable className="bg-gray-50">
      <Container>
        <View className="items-center py-8">
          <Avatar
            name="Usuario Demo"
            size="xl"
            badge={
              <View className="w-8 h-8 bg-blue-500 rounded-full items-center justify-center border-2 border-white">
                <Text className="text-white text-xs">✓</Text>
              </View>
            }
          />
          <Spacer size="md" />
          <Text variant="h3" weight="bold">
            Usuario Demo
          </Text>
          <Text variant="body" color="muted">
            usuario@demo.com
          </Text>
          <Spacer size="sm" />
          <Badge variant="primary">{t('profile.freePlan')}</Badge>
        </View>

        {isProfessional && (
          <>
            <Text variant="h4" weight="bold" className="mb-4">
              {t('profile.statistics')}
            </Text>
            <View className="flex-row gap-2 mb-6">
              <StatCard
                icon="👁️"
                label={t('profile.stats.visits')}
                value="245"
                trend={{ value: 12, isPositive: true }}
              />
              <StatCard
                icon="💬"
                label={t('profile.stats.contacts')}
                value="18"
                trend={{ value: 5, isPositive: true }}
              />
            </View>
          </>
        )}

        <Card variant="outlined" padding="none">
          {profileMenuItems.map((item, index) => (
            <React.Fragment key={item.id}>
              <TouchableOpacity
                className="flex-row items-center p-4 active:bg-gray-50"
                onPress={() => {
                  if (item.screen) {
                    navigation.navigate(item.screen);
                  } else if (item.id === 'logout') {
                    // TODO: Handle logout
                  }
                }}
              >
                <Text className="text-2xl mr-3">{item.icon}</Text>
                <Text variant="body" weight="medium" className="flex-1">
                  {item.label}
                </Text>
                <Text className="text-gray-400">›</Text>
              </TouchableOpacity>
              {index < profileMenuItems.length - 1 && <Divider spacing="none" />}
            </React.Fragment>
          ))}
        </Card>

        <Spacer size="lg" />

        <Button variant="outline" fullWidth onPress={() => navigation.navigate('Subscription')}>
          {t('profile.upgradeToPremium')}
        </Button>

        <Spacer size="md" />

        <Text variant="caption" color="muted" align="center">
          {t('app.version')}
        </Text>
      </Container>
    </Screen>
  );
}

