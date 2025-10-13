/** @jsxImportSource nativewind */
import React, { useState } from 'react';
import { View, TouchableOpacity, Alert } from 'react-native';
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
import {
  ArrowLeft,
  Globe,
  Lock,
  FileText,
  Info,
  ChevronRight,
  Trash2,
  User,
  Briefcase,
} from 'lucide-react-native';
import { useAuth } from '../../contexts/AuthContext';
import { AccountMode } from '@conecteja/supabase';

export default function SettingsScreen({ navigation }: any) {
  const { t } = useTranslation();
  const { currentMode, canSwitchMode, switchMode } = useAuth();
  const [notifications, setNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [isSwitchingMode, setIsSwitchingMode] = useState(false);

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

  const handleSwitchMode = async (newMode: AccountMode) => {
    if (isSwitchingMode) return;

    try {
      setIsSwitchingMode(true);
      await switchMode(newMode);
      Alert.alert(
        t('settings.accountMode.success.title'),
        t('settings.accountMode.success.message', { 
          mode: t(`settings.accountMode.modes.${newMode}`)
        })
      );
    } catch (error) {
      console.error('Error switching mode:', error);
      Alert.alert(
        t('settings.accountMode.error.title'),
        t('settings.accountMode.error.message')
      );
    } finally {
      setIsSwitchingMode(false);
    }
  };

  const menuItems = [
    { id: 'language', icon: Globe, label: t('settings.general.language'), value: 'Español' },
    { id: 'privacy', icon: Lock, label: t('settings.general.privacyPolicy') },
    { id: 'terms', icon: FileText, label: t('settings.general.terms') },
    { id: 'about', icon: Info, label: t('settings.general.about') },
  ];

  return (
    <Screen safe scrollable className="bg-gray-50">
      <Container>
        <View className="flex-row items-center mb-6">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ArrowLeft size={24} className="text-gray-700" />
          </TouchableOpacity>
          <Text variant="h3" weight="bold" className="flex-1 ml-4">
            {t('settings.title')}
          </Text>
        </View>

        {/* Account Mode Selector - Only show if user can switch modes */}
        {canSwitchMode && (
          <View className="mb-6">
            <Text variant="body" weight="bold" className="mb-3">
              {t('settings.accountMode.title')}
            </Text>
            <Card variant="outlined" padding="none">
              <TouchableOpacity
                className="flex-row items-center p-4 active:bg-gray-50"
                onPress={() => handleSwitchMode('client')}
                disabled={isSwitchingMode}
              >
                <View className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${
                  currentMode === 'client' ? 'bg-blue-100' : 'bg-gray-100'
                }`}>
                  <User size={20} color={currentMode === 'client' ? '#3b82f6' : '#6b7280'} />
                </View>
                <View className="flex-1">
                  <Text variant="body" weight="medium">
                    {t('settings.accountMode.modes.client')}
                  </Text>
                  <Text variant="caption" color="muted">
                    {t('settings.accountMode.descriptions.client')}
                  </Text>
                </View>
                {currentMode === 'client' && (
                  <View className="w-6 h-6 rounded-full bg-blue-500 items-center justify-center">
                    <Text className="text-white text-xs">✓</Text>
                  </View>
                )}
              </TouchableOpacity>
              
              <Divider spacing="none" />
              
              <TouchableOpacity
                className="flex-row items-center p-4 active:bg-gray-50"
                onPress={() => handleSwitchMode('professional')}
                disabled={isSwitchingMode}
              >
                <View className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${
                  currentMode === 'professional' ? 'bg-blue-100' : 'bg-gray-100'
                }`}>
                  <Briefcase size={20} color={currentMode === 'professional' ? '#3b82f6' : '#6b7280'} />
                </View>
                <View className="flex-1">
                  <Text variant="body" weight="medium">
                    {t('settings.accountMode.modes.professional')}
                  </Text>
                  <Text variant="caption" color="muted">
                    {t('settings.accountMode.descriptions.professional')}
                  </Text>
                </View>
                {currentMode === 'professional' && (
                  <View className="w-6 h-6 rounded-full bg-blue-500 items-center justify-center">
                    <Text className="text-white text-xs">✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            </Card>
          </View>
        )}

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
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <React.Fragment key={item.id}>
                <TouchableOpacity
                  className="flex-row items-center p-4 active:bg-gray-50"
                  onPress={() => {
                    // TODO: Navigate to respective screens
                  }}
                >
                  <Icon size={22} className="mr-4 text-gray-700" />
                  <Text variant="body" weight="medium" className="flex-1">
                    {item.label}
                  </Text>
                  {item.value && (
                    <Text variant="caption" color="muted" className="mr-2">
                      {item.value}
                    </Text>
                  )}
                  <ChevronRight size={20} className="text-gray-400" />
                </TouchableOpacity>
                {index < menuItems.length - 1 && <Divider spacing="none" />}
              </React.Fragment>
            );
          })}
        </Card>

        <Spacer size="lg" />

        <Card variant="outlined" className="bg-red-50 p-4">
          <TouchableOpacity
            className="flex-row items-center"
            onPress={() => {
              // TODO: Handle account deletion
            }}
          >
            <Trash2 size={22} className="mr-4 text-red-600" />
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
