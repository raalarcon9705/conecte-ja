/** @jsxImportSource nativewind */
import React, { useState } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import {
  Screen,
  Text,
  Avatar,
  Input,
  Button,
  Container,
  Spacer,
  Card,
} from '@conecteja/ui-mobile';

export default function EditProfileScreen({ navigation }: any) {
  const { t } = useTranslation();
  const [name, setName] = useState('Usuario Demo');
  const [email, setEmail] = useState('usuario@demo.com');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    // TODO: Implement save logic
    setTimeout(() => {
      setLoading(false);
      navigation.goBack();
    }, 1000);
  };

  return (
    <Screen safe scrollable className="bg-gray-50">
      <Container>
        <View className="flex-row items-center mb-6">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text className="text-2xl">←</Text>
          </TouchableOpacity>
          <Text variant="h3" weight="bold" className="flex-1 ml-4">
            {t('profile.edit.title')}
          </Text>
        </View>

        <View className="items-center mb-8">
          <Avatar name="Usuario Demo" size="xl" />
          <Spacer size="sm" />
          <Button variant="ghost">
            {t('profile.edit.changePhoto')}
          </Button>
        </View>

        <Card variant="outlined">
          <Input
            label={t('profile.edit.fullName')}
            value={name}
            onChangeText={setName}
            placeholder={t('profile.edit.fullNamePlaceholder')}
          />

          <Input
            label={t('profile.edit.email')}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholder={t('profile.edit.emailPlaceholder')}
          />

          <Input
            label={t('profile.edit.phone')}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            placeholder={t('profile.edit.phonePlaceholder')}
          />

          <Input
            label={t('profile.edit.bio')}
            value={bio}
            onChangeText={setBio}
            placeholder={t('profile.edit.bioPlaceholder')}
            multiline
            numberOfLines={4}
          />
        </Card>

        <Spacer size="lg" />

        <Button
          variant="primary"
          onPress={handleSave}
          loading={loading}
          fullWidth
        >
          {t('profile.edit.saveButton')}
        </Button>

        <Spacer size="md" />

        <Button variant="ghost" onPress={() => navigation.goBack()} fullWidth>
          {t('profile.edit.cancelButton')}
        </Button>
      </Container>
    </Screen>
  );
}

