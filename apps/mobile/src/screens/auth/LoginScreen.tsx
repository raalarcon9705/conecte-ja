/** @jsxImportSource nativewind */
import React, { useState } from 'react';
import { View } from 'react-native';
import { Screen, Text, Input, Button, Spacer, Alert } from '@conecteja/ui-mobile';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createClient } from '@conecteja/supabase';
import { LoginSchema, loginSchema } from '@conecteja/schemas';
import { useAuth } from '../../contexts/AuthContext';
import { Mail, Lock } from 'lucide-react-native';

export default function LoginScreen({ navigation }: any) {
  const { t } = useTranslation();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (formData: LoginSchema) => {
    setLoading(true);
    setApiError('');

    try {
      const supabase = createClient();
      
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email.trim(),
        password: formData.password,
      });

      if (signInError) {
        // Manejar errores específicos de Supabase
        if (signInError.message.includes('Invalid login credentials')) {
          setApiError(t('auth.login.errors.invalidCredentials'));
        } else {
          setApiError(t('auth.login.errors.generic'));
        }
        return;
      }

      if (data?.user) {
        login(data.user);
      }
    } catch (err) {
      console.error('Login error:', err);
      setApiError(t('auth.login.errors.generic'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen safe scrollable className="bg-white" contentContainerClassName="flex-1">
      <View className="flex-1 justify-center px-6">
        <View className="items-center mb-12">
          <Text variant="h1" weight="bold" className="text-blue-600 mb-2">
            {t('auth.login.title')}
          </Text>
          <Text variant="body" color="muted">
            {t('auth.login.subtitle')}
          </Text>
        </View>

        {apiError ? (
          <Alert variant="error" className="mb-4">
            {apiError}
          </Alert>
        ) : null}

        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <View className="mb-4">
              <Input
                label={t('auth.login.email')}
                placeholder={t('auth.login.emailPlaceholder')}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                keyboardType="email-address"
                autoCapitalize="none"
                leftIcon={<Mail size={20} color="#6b7280" />}
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
                label={t('auth.login.password')}
                placeholder={t('auth.login.passwordPlaceholder')}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                secureTextEntry
                leftIcon={<Lock size={20} color="#6b7280" />}
              />
              {errors.password && (
                <Text className="text-red-600 text-xs mt-1">
                  {t(errors.password.message!)}
                </Text>
              )}
            </View>
          )}
        />

        <View className="flex-row justify-end mb-4">
          <Text
            color="primary"
            weight="semibold"
            onPress={() => navigation.navigate('AccountRecovery')}
          >
            {t('auth.login.forgotPassword')}
          </Text>
        </View>

        <Button
          variant="primary"
          onPress={handleSubmit(onSubmit)}
          loading={loading}
          disabled={!isValid || loading}
          fullWidth
        >
          {t('auth.login.loginButton')}
        </Button>

        {/* Temporalmente ocultos: Google y Apple auth */}
        {/*
        <Spacer size="md" />

        <View className="flex-row items-center">
          <Divider className="flex-1" />
          <Text className="mx-4" color="muted">{t('auth.login.orContinueWith')}</Text>
          <Divider className="flex-1" />
        </View>

        <Spacer size="md" />

        <Button
          variant="outline"
          fullWidth
          className="mb-3"
          leftIcon={<Google color="#2563eb" />}
        >
          {t('auth.login.continueGoogle')}
        </Button>

        <Button
          variant="outline"
          fullWidth
          leftIcon={<Apple size={20} color="#2563eb" />}
        >
          {t('auth.login.continueApple')}
        </Button>
        */}

        <Spacer size="lg" />

        <View className="flex-row justify-center">
          <Text color="muted">{t('auth.login.noAccount')}</Text>
          <Text
            color="primary"
            weight="semibold"
            onPress={() => navigation.navigate('Register')}
          >
            {t('auth.login.signUp')}
          </Text>
        </View>
      </View>
    </Screen>
  );
}

