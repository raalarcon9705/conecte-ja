/** @jsxImportSource nativewind */
import React, { useState } from 'react';
import { View } from 'react-native';
import { Screen, Text, Input, Button, Spacer, Divider } from '@conecteja/ui-mobile';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { createClient } from '@conecteja/supabase';

export default function LoginScreen({ navigation }: any) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  // Schema de validación con Zod
  const loginSchema = z.object({
    email: z
      .string({ required_error: t('auth.login.errors.emailRequired') })
      .min(1, t('auth.login.errors.emailRequired'))
      .email(t('auth.login.errors.emailInvalid')),
    password: z
      .string({ required_error: t('auth.login.errors.passwordRequired') })
      .min(6, t('auth.login.errors.passwordMinLength')),
  });

  type LoginFormData = z.infer<typeof loginSchema>;

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (formData: LoginFormData) => {
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
        // Login exitoso - navegar a la pantalla principal
        // TODO: Guardar sesión en AsyncStorage o contexto global
        navigation.reset({
          index: 0,
          routes: [{ name: 'MainTabs' }],
        });
      }
    } catch (err) {
      console.error('Login error:', err);
      setApiError(t('auth.login.errors.generic'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen safe scrollable className="bg-white">
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
          <View className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <Text className="text-red-600 text-sm">{apiError}</Text>
          </View>
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
              />
              {errors.email && (
                <Text className="text-red-600 text-xs mt-1">
                  {errors.email.message}
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
              />
              {errors.password && (
                <Text className="text-red-600 text-xs mt-1">
                  {errors.password.message}
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
          {t('auth.login.loginButton')}
        </Button>

        <Spacer size="md" />

        <View className="flex-row items-center">
          <Divider className="flex-1" />
          <Text className="mx-4" color="muted">{t('auth.login.orContinueWith')}</Text>
          <Divider className="flex-1" />
        </View>

        <Spacer size="md" />

        <Button variant="outline" fullWidth className="mb-3">
          {t('auth.login.continueGoogle')}
        </Button>

        <Button variant="outline" fullWidth>
          {t('auth.login.continueApple')}
        </Button>

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

