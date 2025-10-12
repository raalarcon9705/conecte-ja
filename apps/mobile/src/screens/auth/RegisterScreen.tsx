/** @jsxImportSource nativewind */
import React, { useState } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Screen, Text, Input, Button, Spacer, Checkbox, RadioButton } from '@conecteja/ui-mobile';

export default function RegisterScreen({ navigation }: any) {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userType, setUserType] = useState<'client' | 'professional'>('client');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!acceptTerms) return;
    setLoading(true);
    // TODO: Implement register logic
    setTimeout(() => {
      setLoading(false);
    }, 1000);
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

        <Input
          label={t('auth.register.fullName')}
          placeholder={t('auth.register.fullNamePlaceholder')}
          value={name}
          onChangeText={setName}
        />

        <Input
          label={t('auth.register.email')}
          placeholder={t('auth.register.emailPlaceholder')}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Input
          label={t('auth.register.password')}
          placeholder={t('auth.register.passwordPlaceholder')}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <Input
          label={t('auth.register.confirmPassword')}
          placeholder={t('auth.register.confirmPasswordPlaceholder')}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />

        <Spacer size="md" />

        <Text variant="body" weight="medium" className="mb-3">
          {t('auth.register.userTypeQuestion')}
        </Text>

        <View className="mb-4">
          <RadioButton
            selected={userType === 'client'}
            onSelect={() => setUserType('client')}
            label={t('auth.register.userTypeClient')}
          />
          <Spacer size="sm" />
          <RadioButton
            selected={userType === 'professional'}
            onSelect={() => setUserType('professional')}
            label={t('auth.register.userTypeProfessional')}
          />
        </View>

        <Spacer size="md" />

        <Checkbox
          checked={acceptTerms}
          onChange={setAcceptTerms}
          label={t('auth.register.acceptTerms')}
        />

        <Spacer size="lg" />

        <Button
          variant="primary"
          onPress={handleRegister}
          loading={loading}
          fullWidth
          disabled={!acceptTerms}
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

