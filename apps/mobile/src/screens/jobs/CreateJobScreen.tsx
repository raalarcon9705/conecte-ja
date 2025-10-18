/** @jsxImportSource nativewind */
import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { MapPin, ArrowLeft } from 'lucide-react-native';
import {
  Screen,
  Text,
  Input,
  Button,
  Container,
  Spacer,
  LocationMap,
} from '@conecteja/ui-mobile';
import { useAuth } from '../../contexts/AuthContext';
import { useSupabase } from '../../hooks/useSupabase';
import { LocationPrivacy } from '@conecteja/utils';

export default function CreateJobScreen({ navigation }: any) {
  const { t } = useTranslation();
  const { user, currentMode } = useAuth();
  const supabase = useSupabase();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [budgetMin, setBudgetMin] = useState('');
  const [budgetMax, setBudgetMax] = useState('');
  const [budgetType, setBudgetType] = useState<'hourly' | 'daily' | 'fixed' | 'negotiable'>('negotiable');
  const [startDate, setStartDate] = useState('');
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

  // Mock location - in real app, use geolocation
  const [coordinates, setCoordinates] = useState({
    latitude: -34.6037,
    longitude: -58.3816,
  });

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
        location_city: location.trim() || null,
        location_latitude: coordinates.latitude,
        location_longitude: coordinates.longitude,
        budget_min: budgetMin ? parseFloat(budgetMin) : null,
        budget_max: budgetMax ? parseFloat(budgetMax) : null,
        budget_type: budgetType,
        start_date: startDate || null,
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

          {/* Location */}
          <View className="mb-4">
            <Text variant="body" weight="medium" className="mb-2">
              {t('jobs.create.location')}
            </Text>
            <Input
              value={location}
              onChangeText={setLocation}
              placeholder={t('jobs.create.locationPlaceholder')}
              leftIcon={<MapPin size={20} color="#6b7280" />}
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
            <Text variant="caption" color="muted" className="mt-2">
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
            <Text variant="body" weight="medium" className="mb-2">
              {t('jobs.create.startDate')}
            </Text>
            <Input
              value={startDate}
              onChangeText={setStartDate}
              placeholder={t('jobs.create.startDatePlaceholder')}
              keyboardType="numeric"
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
