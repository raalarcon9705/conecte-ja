/** @jsxImportSource nativewind */
import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react-native';
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
import { useAuth } from '../../contexts/AuthContext';
import { useProfile } from '../../contexts/ProfileContext';

export default function EditProfileScreen({ navigation }: any) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { profile, loading: profileLoading, fetchProfile, updateProfile } = useProfile();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.id && !profile) {
      fetchProfile(user.id);
    }
  }, [user]);

  useEffect(() => {
    if (profile) {
      setName(profile.full_name || '');
      setEmail(user?.email || '');
      setPhone(profile.phone || '');
      setBio(profile.bio || '');
      setAddress(profile.address || '');
      setCity(profile.city || '');
      setState(profile.state || '');
    }
  }, [profile, user]);

  const handleSave = async () => {
    try {
      setLoading(true);
      
      await updateProfile({
        full_name: name,
        phone: phone || null,
        bio: bio || null,
        address: address || null,
        city: city || null,
        state: state || null,
      });

      Alert.alert(t('common.success') || 'Éxito', t('profile.edit.successMessage') || 'Perfil actualizado exitosamente');
      navigation.goBack();
    } catch (error: any) {
      console.error('Error updating profile:', error);
      Alert.alert(t('common.error') || 'Error', error.message || t('profile.edit.errorMessage') || 'No se pudo actualizar el perfil');
    } finally {
      setLoading(false);
    }
  };

  if (profileLoading && !profile) {
    return (
      <Screen safe className="bg-gray-50">
        <Container className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3B82F6" />
        </Container>
      </Screen>
    );
  }

  return (
    <Screen safe scrollable className="bg-gray-50">
      <Container>
        <View className="flex-row items-center mb-6">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ArrowLeft size={24} color="#374151" />
          </TouchableOpacity>
          <Text variant="h3" weight="bold" className="flex-1 ml-4">
            {t('profile.edit.title')}
          </Text>
        </View>

        <View className="items-center mb-8">
          <Avatar 
            name={name || 'Usuario'} 
            size="xl"
            uri={profile?.avatar_url}
          />
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
            editable={false}
            className="opacity-50"
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

          <Input
            label="Dirección"
            value={address}
            onChangeText={setAddress}
            placeholder="Ej: Av. Principal 123"
          />

          <View className="flex-row gap-2">
            <View className="flex-1">
              <Input
                label="Ciudad"
                value={city}
                onChangeText={setCity}
                placeholder="Ej: Buenos Aires"
              />
            </View>
            <View className="flex-1">
              <Input
                label="Estado/Provincia"
                value={state}
                onChangeText={setState}
                placeholder="Ej: BA"
              />
            </View>
          </View>
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

