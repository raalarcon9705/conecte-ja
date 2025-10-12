/** @jsxImportSource nativewind */
import React, { useState } from 'react';
import { View, TouchableOpacity, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import {
  Screen,
  Text,
  Card,
  Container,
  Spacer,
  Divider,
  Switch,
} from '@conecteja/ui-mobile';

export default function SettingsScreen({ navigation }: any) {
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [locationEnabled, setLocationEnabled] = useState(true);

  const settingsSections = [
    {
      title: t('settings.notifications.title'),
      items: [
        {
          id: 'push',
          label: t('settings.notifications.push'),
          value: notifications,
          onChange: setNotifications,
        },
        {
          id: 'email',
          label: t('settings.notifications.email'),
          value: emailNotifications,
          onChange: setEmailNotifications,
        },
      ],
    },
    {
      title: t('settings.privacy.title'),
      items: [
        {
          id: 'location',
          label: t('settings.privacy.shareLocation'),
          value: locationEnabled,
          onChange: setLocationEnabled,
        },
      ],
    },
  ];

  const menuItems = [
    { id: 'language', icon: '🌐', label: t('settings.general.language'), value: 'Español' },
    { id: 'privacy', icon: '🔒', label: t('settings.general.privacyPolicy') },
    { id: 'terms', icon: '📄', label: t('settings.general.terms') },
    { id: 'about', icon: 'ℹ️', label: t('settings.general.about') },
  ];

  return (
    <Screen safe scrollable className="bg-gray-50">
      <Container>
        <View className="flex-row items-center mb-6">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text className="text-2xl">←</Text>
          </TouchableOpacity>
          <Text variant="h3" weight="bold" className="flex-1 ml-4">
            {t('settings.title')}
          </Text>
        </View>

        {settingsSections.map((section) => (
          <View key={section.title} className="mb-6">
            <Text variant="body" weight="bold" className="mb-3">
              {section.title}
            </Text>
            <Card variant="outlined" padding="none">
              {section.items.map((item, index) => (
                <React.Fragment key={item.id}>
                  <View className="px-4 py-3">
                    <Switch
                      label={item.label}
                      value={item.value}
                      onValueChange={item.onChange}
                    />
                  </View>
                  {index < section.items.length - 1 && <Divider spacing="none" />}
                </React.Fragment>
              ))}
            </Card>
          </View>
        ))}

        <Text variant="body" weight="bold" className="mb-3">
          {t('settings.general.title')}
        </Text>
        <Card variant="outlined" padding="none">
          {menuItems.map((item, index) => (
            <React.Fragment key={item.id}>
              <TouchableOpacity
                className="flex-row items-center p-4 active:bg-gray-50"
                onPress={() => {
                  // TODO: Navigate to respective screens
                }}
              >
                <Text className="text-2xl mr-3">{item.icon}</Text>
                <Text variant="body" weight="medium" className="flex-1">
                  {item.label}
                </Text>
                {item.value && (
                  <Text variant="caption" color="muted" className="mr-2">
                    {item.value}
                  </Text>
                )}
                <Text className="text-gray-400">›</Text>
              </TouchableOpacity>
              {index < menuItems.length - 1 && <Divider spacing="none" />}
            </React.Fragment>
          ))}
        </Card>

        <Spacer size="lg" />

        <Card variant="outlined" className="bg-red-50">
          <TouchableOpacity
            className="flex-row items-center"
            onPress={() => {
              // TODO: Handle account deletion
            }}
          >
            <Text className="text-2xl mr-3">🗑️</Text>
            <View className="flex-1">
              <Text variant="body" weight="bold" className="text-red-600">
                {t('settings.deleteAccount.title')}
              </Text>
              <Text variant="caption" color="muted">
                {t('settings.deleteAccount.description')}
              </Text>
            </View>
          </TouchableOpacity>
        </Card>

        <Spacer size="lg" />

        <Text variant="caption" color="muted" align="center">
          {t('settings.footer')}{'\n'}
          {t('app.copyright')}
        </Text>
      </Container>
    </Screen>
  );
}

