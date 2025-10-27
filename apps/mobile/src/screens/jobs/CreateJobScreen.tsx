/** @jsxImportSource nativewind */
import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react-native';
import {
  Screen,
  Text,
  Input,
  Button,
  Container,
  Spacer,
  LocationMap,
  DatePicker,
  AddressForm,
} from '@conecteja/ui-mobile';
import { useAuth } from '../../contexts/AuthContext';
import { useProfile } from '../../contexts/ProfileContext';
import { useSupabase } from '../../hooks/useSupabase';
import { LocationPrivacy } from '@conecteja/utils';
import { CreateJobScreenProps } from '../../types/navigation';

export default function CreateJobScreen({ navigation }: CreateJobScreenProps) {
  const { t } = useTranslation();
  const { user, currentMode } = useAuth();
  const { profile } = useProfile();
  const supabase = useSupabase();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState({
    postalCode: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
  });

  // Initialize address with user's profile data
  React.useEffect(() => {
    if (profile?.address && profile?.city && !address.postalCode) {
      setAddress(prev => ({
        ...prev,
        street: profile.address || '',
        city: profile.city || '',
      }));
    }
  }, [profile, address.postalCode]);
  const [budgetMin, setBudgetMin] = useState('');
  const [budgetMax, setBudgetMax] = useState('');
  const [budgetType, setBudgetType] = useState<'hourly' | 'daily' | 'fixed' | 'negotiable'>('negotiable');
  const [startDate, setStartDate] = useState(new Date());
  const [isRecurring, setIsRecurring] = useState(false);
  const [loading, setLoading] = useState(false);

  // Redirect professionals to home - job creation is only for clients
  React.useEffect(() => {
    if (currentMode === 'professional') {
      Alert.alert(
        t('common.error'),
        t('jobs.create.errors.clientOnly'),
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    }
  }, [currentMode, navigation, t]);

  // Check if address form is complete (all required fields filled)
  const isAddressComplete = address.postalCode && address.street && address.number && address.neighborhood && address.city && address.state;

  // State for geocoded coordinates
  const [geocodedCoordinates, setGeocodedCoordinates] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isGeocoding, setIsGeocoding] = useState(false);

  // Geocoding function using OpenStreetMap Nominatim
  const geocodeAddress = React.useCallback(async (addressData: typeof address) => {
    setIsGeocoding(true);
    try {
      const fullAddress = `${addressData.street}, ${addressData.number}${addressData.complement ? `, ${addressData.complement}` : ''}, ${addressData.neighborhood}, ${addressData.city}, ${addressData.state}, Brasil`;

      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullAddress)}&limit=1&countrycodes=br`
      );

      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
          const result = data[0];
          setGeocodedCoordinates({
            latitude: parseFloat(result.lat),
            longitude: parseFloat(result.lon)
          });
          console.log('Geocoded coordinates:', { lat: result.lat, lon: result.lon });
        }
      }
    } catch (error) {
      console.error('Error geocoding address:', error);
    } finally {
      setIsGeocoding(false);
    }
  }, []);

  // Geocode address when form is completed
  React.useEffect(() => {
    if (isAddressComplete) {
      geocodeAddress(address);
    }
  }, [isAddressComplete, address, geocodeAddress]);

  // Use geocoded coordinates, user's location, or default to Centro Florianópolis
  const coordinates = geocodedCoordinates
    ? geocodedCoordinates
    : profile?.latitude && profile?.longitude
    ? { latitude: profile.latitude, longitude: profile.longitude }
    : { latitude: -27.5954, longitude: -48.5480 };

  const handleAddressChange = React.useCallback((newAddress: {
    postalCode: string;
    street: string;
    number: string;
    complement: string;
    neighborhood: string;
    city: string;
    state: string;
  }) => {
    setAddress(newAddress);
  }, []);

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      Alert.alert(t('common.error'), t('jobs.create.errors.requiredFields'));
      return;
    }

    if (!user?.id) {
      Alert.alert(t('common.error'), t('jobs.create.errors.loginRequired'));
      return;
    }

    try {
      setLoading(true);

      const jobData = {
        client_profile_id: user.id,
        title: title.trim(),
        description: description.trim(),
        location_city: address.city || null,
        location_latitude: coordinates.latitude,
        location_longitude: coordinates.longitude,
        budget_min: budgetMin ? parseFloat(budgetMin) : null,
        budget_max: budgetMax ? parseFloat(budgetMax) : null,
        budget_type: budgetType,
        start_date: startDate ? startDate.toISOString() : null,
        is_recurring: isRecurring,
        status: 'open',
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      };

      const { data, error } = await supabase
        .from('job_postings')
        .insert([jobData])
        .select()
        .single();

      if (error) throw error;

      Alert.alert(
        t('jobs.create.success.title'),
        t('jobs.create.success.message'),
        [
          {
            text: t('jobs.create.success.viewJob'),
            onPress: () => {
              navigation.replace('JobDetail', { jobId: data.id });
            },
          },
          {
            text: t('jobs.create.success.viewAll'),
            onPress: () => {
              navigation.goBack();
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error creating job:', error);
      Alert.alert(t('common.error'), t('jobs.create.errors.publishFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen safe className="bg-gray-50">
      <ScrollView>
        <Container>
          {/* Header */}
          <View className="flex-row items-center mb-6">
            <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
              <ArrowLeft size={24} color="#374151" />
            </TouchableOpacity>
            <Text variant="h3" weight="bold" className="flex-1">
              {t('jobs.create.title')}
            </Text>
          </View>

          <Text variant="body" color="muted" className="mb-6">
            {t('jobs.create.subtitle')}
          </Text>

          {/* Title */}
          <View className="mb-4">
            <Text variant="body" weight="medium" className="mb-2">
              {t('jobs.create.titleField')} *
            </Text>
            <Input
              value={title}
              onChangeText={setTitle}
              placeholder={t('jobs.create.titlePlaceholder')}
              maxLength={100}
            />
          </View>

          {/* Description */}
          <View className="mb-4">
            <Text variant="body" weight="medium" className="mb-2">
              {t('jobs.create.descriptionField')} *
            </Text>
            <Input
              value={description}
              onChangeText={setDescription}
              placeholder={t('jobs.create.descriptionPlaceholder')}
              multiline
              numberOfLines={6}
              maxLength={1000}
            />
            <Text variant="caption" color="muted" className="mt-1">
              {t('jobs.create.charactersCount', { count: description.length })}
            </Text>
          </View>

          {/* Address */}
          <View className="mb-4">
            <AddressForm
              onAddressChange={handleAddressChange}
              initialValues={address}
              labels={{
                postalCode: t('jobs.create.address.postalCode'),
                street: t('jobs.create.address.street'),
                number: t('jobs.create.address.number'),
                complement: t('jobs.create.address.complement'),
                neighborhood: t('jobs.create.address.neighborhood'),
                city: t('jobs.create.address.city'),
                state: t('jobs.create.address.state'),
              }}
              placeholders={{
                postalCode: t('jobs.create.address.postalCodePlaceholder'),
                street: t('jobs.create.address.streetPlaceholder'),
                number: t('jobs.create.address.numberPlaceholder'),
                complement: t('jobs.create.address.complementPlaceholder'),
                neighborhood: t('jobs.create.address.neighborhoodPlaceholder'),
                city: t('jobs.create.address.cityPlaceholder'),
                state: t('jobs.create.address.statePlaceholder'),
              }}
            />
          </View>

          {/* Map Preview */}
          <View className="mb-6">
            <Text variant="body" weight="medium" className="mb-2">
              {t('jobs.create.locationPreview')}
            </Text>
            <LocationMap
              latitude={coordinates.latitude}
              longitude={coordinates.longitude}
              privacy={LocationPrivacy.APPROXIMATE}
              radius={1000}
            />
            {isAddressComplete && (
              <Text variant="caption" color="muted" className="mt-2">
                {t('jobs.create.address.selected')}: {address.street}, {address.number}{address.complement ? `, ${address.complement}` : ''}, {address.neighborhood}, {address.city} - {address.state}
              </Text>
            )}
            {isAddressComplete && isGeocoding && (
              <Text variant="caption" color="muted" className="mt-1">
                {t('jobs.create.address.geocoding')}
              </Text>
            )}
            {isAddressComplete && !isGeocoding && geocodedCoordinates && (
              <Text variant="caption" color="success" className="mt-1">
                {t('jobs.create.address.coordinatesFound')}: {geocodedCoordinates.latitude.toFixed(6)}, {geocodedCoordinates.longitude.toFixed(6)}
              </Text>
            )}
            {address.postalCode && !isAddressComplete && (
              <Text variant="caption" color="error" className="mt-2">
                {t('jobs.create.address.completeRequired')}
              </Text>
            )}
            {!address.postalCode && profile?.address && (
              <Text variant="caption" color="muted" className="mt-2">
                {t('jobs.create.address.default')}: {profile.address}, {profile.city}
              </Text>
            )}
            {!address.postalCode && !profile?.address && (
              <Text variant="caption" color="muted" className="mt-2">
                {t('jobs.create.address.default')}: Centro de Florianópolis
              </Text>
            )}
            <Text variant="caption" color="muted" className="mt-1">
              {t('jobs.create.locationNote')}
            </Text>
          </View>

          {/* Budget */}
          <View className="mb-4">
            <Text variant="body" weight="medium" className="mb-2">
              {t('jobs.create.budget')}
            </Text>
            <View className="flex-row gap-2 mb-2">
              <View className="flex-1">
                <Input
                  value={budgetMin}
                  onChangeText={setBudgetMin}
                  placeholder={t('jobs.create.budgetMin')}
                  keyboardType="numeric"
                />
              </View>
              <View className="flex-1">
                <Input
                  value={budgetMax}
                  onChangeText={setBudgetMax}
                  placeholder={t('jobs.create.budgetMax')}
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* Budget Type */}
            <View className="flex-row gap-2">
              {(['hourly', 'daily', 'fixed', 'negotiable'] as const).map((type) => (
                <TouchableOpacity
                  key={type}
                  className={`flex-1 py-2 px-3 rounded-lg border ${
                    budgetType === type
                      ? 'bg-blue-50 border-blue-500'
                      : 'bg-white border-gray-200'
                  }`}
                  onPress={() => setBudgetType(type)}
                >
                  <Text
                    variant="caption"
                    weight="medium"
                    className={`text-center ${
                      budgetType === type ? 'text-blue-600' : 'text-gray-600'
                    }`}
                  >
                    {t(`jobs.create.budgetTypes.${type}`)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Start Date */}
          <View className="mb-4">
            <DatePicker
              value={startDate}
              onChange={setStartDate}
              label={t('jobs.create.startDate')}
              placeholder={t('jobs.create.startDatePlaceholder')}
              mode="date"
              minimumDate={new Date()}
            />
          </View>

          {/* Recurring */}
          <TouchableOpacity
            className="flex-row items-center mb-6"
            onPress={() => setIsRecurring(!isRecurring)}
          >
            <View
              className={`w-6 h-6 rounded border-2 mr-3 items-center justify-center ${
                isRecurring ? 'bg-blue-600 border-blue-600' : 'border-gray-300'
              }`}
            >
              {isRecurring && <Text className="text-white text-xs">✓</Text>}
            </View>
            <Text variant="body">{t('jobs.create.recurring')}</Text>
          </TouchableOpacity>

          {/* Submit Button */}
          <Button
            variant="primary"
            size="lg"
            onPress={handleSubmit}
            loading={loading}
            disabled={loading}
          >
            {t('jobs.create.submit')}
          </Button>

          <Spacer size="xl" />
        </Container>
      </ScrollView>
    </Screen>
  );
}
