/** @jsxImportSource nativewind */
import React, { useState } from 'react';
import { View } from 'react-native';
import { Screen, Text, Input, Button, Spacer, Alert } from '@conecteja/ui-mobile';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PasswordRecoverySchema, passwordRecoverySchema } from '@conecteja/schemas';
import { useAuth } from '../../contexts/AuthContext';
import { AccountRecoveryScreenNavigationProp } from '../../types/navigation';

interface AccountRecoveryScreenProps {
  navigation: AccountRecoveryScreenNavigationProp;
}

export default function AccountRecoveryScreen({ navigation }: AccountRecoveryScreenProps) {
  const { t } = useTranslation();
  const { sendPasswordResetEmail } = useAuth();
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<PasswordRecoverySchema>({
    resolver: zodResolver(passwordRecoverySchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (formData: PasswordRecoverySchema) => {
    setLoading(true);
    setApiError('');
    setSuccessMessage('');

    try {
      await sendPasswordResetEmail(formData.email);
      setSuccessMessage(t('auth.passwordRecovery.successMessage'));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : t('auth.passwordRecovery.errors.generic');
      setApiError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen safe scrollable className="bg-white" contentContainerClassName="flex-1">
      <View className="flex-1 justify-center px-6">
        <View className="items-center mb-12">
          <Text variant="h1" weight="bold" className="text-blue-600 mb-2">
            {t('auth.passwordRecovery.title')}
          </Text>
          <Text variant="body" color="muted" className="text-center">
            {t('auth.passwordRecovery.subtitle')}
          </Text>
        </View>

        {apiError ? (
          <Alert variant="error" className="mb-4">
            {apiError}
          </Alert>
        ) : null}

        {successMessage ? (
          <Alert variant="success" className="mb-4">
            {successMessage}
          </Alert>
        ) : null}

        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <View className="mb-4">
              <Input
                label={t('auth.passwordRecovery.email')}
                placeholder={t('auth.passwordRecovery.emailPlaceholder')}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {errors.email && (
                <Text className="text-red-600 text-xs mt-1">
                  {t(errors.email.message!)}
                </Text>
              )}
            </View>
          )}
        />

        <Button
          variant="primary"
          onPress={handleSubmit(onSubmit)}
          loading={loading}
          disabled={!isValid || loading}
          fullWidth
        >
          {t('auth.passwordRecovery.sendButton')}
        </Button>

        <Spacer size="lg" />

        <View className="flex-row justify-center">
          <Text
            color="primary"
            weight="semibold"
            onPress={() => navigation.navigate('Login')}
          >
            {t('auth.passwordRecovery.backToLogin')}
          </Text>
        </View>
      </View>
    </Screen>
  );
}
