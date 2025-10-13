/** @jsxImportSource nativewind */
import React from 'react';
import { View } from 'react-native';
import { Mail } from 'lucide-react-native';
import { Screen, Text, Button, Spacer } from '@conecteja/ui-mobile';
import { useTranslation } from 'react-i18next';

interface RegistrationSuccessScreenProps {
  navigation: any;
  route: any;
}

export default function RegistrationSuccessScreen({ navigation, route }: RegistrationSuccessScreenProps) {
  const { t } = useTranslation();
  const email = route?.params?.email || '';

  return (
    <Screen safe className="bg-white">
      <View className="flex-1 justify-center px-6">
        {/* Success Icon */}
        <View className="items-center mb-8">
          <View className="w-24 h-24 bg-green-100 rounded-full items-center justify-center mb-6">
            <Mail size={48} color="#16A34A" />
          </View>

          <Text variant="h1" weight="bold" className="text-green-600 mb-3 text-center">
            {t('auth.registrationSuccess.title')}
          </Text>

          <Text variant="body" color="muted" className="text-center mb-4">
            {t('auth.registrationSuccess.subtitle')}
          </Text>

          {email ? (
            <View className="bg-gray-50 px-4 py-3 rounded-lg mb-4">
              <Text variant="body" weight="semibold" className="text-center text-blue-600">
                {email}
              </Text>
            </View>
          ) : null}

          <Text variant="body" color="muted" className="text-center">
            {t('auth.registrationSuccess.instructions')}
          </Text>
        </View>

        {/* Action Buttons */}
        <View className="mb-4">
          <Button
            variant="primary"
            onPress={() => navigation.navigate('Login')}
            fullWidth
          >
            {t('auth.registrationSuccess.goToLogin')}
          </Button>
        </View>

        <Spacer size="lg" />

        {/* Additional Help */}
        <View className="items-center">
          <Text variant="caption" color="muted" className="text-center mb-2">
            {t('auth.registrationSuccess.noEmail')}
          </Text>
          <Text
            variant="caption"
            color="primary"
            weight="semibold"
            className="text-center"
          >
            {t('auth.registrationSuccess.checkSpam')}
          </Text>
        </View>
      </View>
    </Screen>
  );
}

