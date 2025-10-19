/** @jsxImportSource nativewind */
import React, { useState } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Screen, Text, Input, Button, Spacer, Checkbox, RadioButton, Alert } from '@conecteja/ui-mobile';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { RegisterSchema, registerSchema } from '@conecteja/schemas';
import { useAuth } from '../../contexts/AuthContext';
import { RegisterScreenProps } from '../../types/navigation';

export default function RegisterScreen({ navigation }: RegisterScreenProps) {
  const { t } = useTranslation();
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      userType: 'client',
      acceptTerms: false,
    },
  });

  const onSubmit = async (formData: RegisterSchema) => {
    setLoading(true);
    setApiError('');
    try {
      await register(formData);
      // Navigate to success screen with email
      navigation.navigate('RegistrationSuccess', { email: formData.email });
    } catch (error: unknown) {
      setApiError(error instanceof Error ? error.message : t('auth.register.errors.generic'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen safe scrollable className="bg-white">
      <View className="flex-1 px-6 py-8">
        <Text variant="h2" weight="bold" className="mb-2">
          {t('auth.register.title')}
        </Text>
        <Text variant="body" color="muted" className="mb-8">
          {t('auth.register.subtitle')}
        </Text>

        {apiError ? (
          <Alert variant="error" className="mb-4">
            {apiError}
          </Alert>
        ) : null}

        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, onBlur, value } }) => (
            <View className="mb-4">
              <Input
                label={t('auth.register.fullName')}
                placeholder={t('auth.register.fullNamePlaceholder')}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
              />
              {errors.name && (
                <Text className="text-red-600 text-xs mt-1">
                  {t(errors.name.message!)}
                </Text>
              )}
            </View>
          )}
        />

        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <View className="mb-4">
              <Input
                label={t('auth.register.email')}
                placeholder={t('auth.register.emailPlaceholder')}
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

        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value } }) => (
            <View className="mb-4">
              <Input
                label={t('auth.register.password')}
                placeholder={t('auth.register.passwordPlaceholder')}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                secureTextEntry
              />
              {errors.password && (
                <Text className="text-red-600 text-xs mt-1">
                  {t(errors.password.message!)}
                </Text>
              )}
            </View>
          )}
        />

        <Controller
          control={control}
          name="confirmPassword"
          render={({ field: { onChange, onBlur, value } }) => (
            <View className="mb-4">
              <Input
                label={t('auth.register.confirmPassword')}
                placeholder={t('auth.register.confirmPasswordPlaceholder')}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                secureTextEntry
              />
              {errors.confirmPassword && (
                <Text className="text-red-600 text-xs mt-1">
                  {t(errors.confirmPassword.message!)}
                </Text>
              )}
            </View>
          )}
        />

        <Spacer size="md" />

        <Text variant="body" weight="medium" className="mb-3">
          {t('auth.register.userTypeQuestion')}
        </Text>

        <Controller
          control={control}
          name="userType"
          render={({ field: { value, onChange } }) => (
            <View className="mb-4">
              <RadioButton
                selected={value === 'client'}
                onSelect={() => onChange('client')}
                label={t('auth.register.userTypeClient')}
              />
              <Spacer size="sm" />
              <RadioButton
                selected={value === 'professional'}
                onSelect={() => onChange('professional')}
                label={t('auth.register.userTypeProfessional')}
              />
            </View>
          )}
        />

        <Spacer size="md" />

        <Controller
          control={control}
          name="acceptTerms"
          render={({ field: { value, onChange } }) => (
            <Checkbox
              checked={value}
              onChange={onChange}
              label={t('auth.register.acceptTerms')}
            />
          )}
        />
        {errors.acceptTerms && (
          <Text className="text-red-600 text-xs mt-1">
            {t(errors.acceptTerms.message!)}
          </Text>
        )}

        <Spacer size="lg" />

        <Button
          variant="primary"
          onPress={handleSubmit(onSubmit)}
          loading={loading}
          fullWidth
          disabled={!isValid || loading}
        >
          {t('auth.register.createButton')}
        </Button>

        <Spacer size="md" />

        <View className="flex-row justify-center">
          <Text color="muted">{t('auth.register.haveAccount')}</Text>
          <Text
            color="primary"
            weight="semibold"
            onPress={() => navigation.navigate('Login')}
          >
            {t('auth.register.signIn')}
          </Text>
        </View>
      </View>
    </Screen>
  );
}

