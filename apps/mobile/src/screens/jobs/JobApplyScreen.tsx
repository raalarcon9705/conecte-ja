/** @jsxImportSource nativewind */
import React, { useState, useEffect } from 'react';
import { View, ScrollView, Alert, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react-native';
import {
  Screen,
  Text,
  Input,
  Button,
  Container,
  Spacer,
  Card,
} from '@conecteja/ui-mobile';
import { useAuth } from '../../contexts/AuthContext';
import { useSupabase } from '../../hooks/useSupabase';
import { formatCurrency } from '@conecteja/utils';
import { JobApplyScreenProps } from '../../types/navigation';
import { JobPostingWithDetails } from '../../contexts';

export default function JobApplyScreen({ route, navigation }: JobApplyScreenProps) {
  const { jobId } = route.params;
  const { t } = useTranslation();
  const { user, currentMode } = useAuth();
  const supabase = useSupabase();

  const [job, setJob] = useState<JobPostingWithDetails | null>(null);
  const [professionalProfile, setProfessionalProfile] = useState<unknown>(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [proposedPrice, setProposedPrice] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Redirect clients to job detail - applications are only for professionals
  useEffect(() => {
    if (currentMode === 'client') {
      Alert.alert(
        t('common.error'),
        t('jobs.apply.errors.professionalOnly'),
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    }
  }, [currentMode, navigation, t]);

  useEffect(() => {
    if (currentMode === 'professional') {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentMode]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Fetch job details
      const { data: jobData, error: jobError } = await supabase
        .from('job_postings')
        .select('*, profiles!job_postings_client_profile_id_fkey(full_name), categories(name)')
        .eq('id', jobId)
        .single();

      if (jobError) throw jobError;

      // Check if user is the owner of this job posting
      if (jobData.client_profile_id === user?.id) {
        Alert.alert(
          t('common.error'),
          t('jobs.apply.errors.cannotApplyOwn'),
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
        return;
      }

      setJob(jobData as unknown as JobPostingWithDetails);

      // Fetch professional profile
      if (!user?.id) {
        Alert.alert(
          t('common.error'),
          t('jobs.apply.errors.loginRequired'),
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
        return;
      }

      const { data: profData, error: profError } = await supabase
        .from('professional_profiles')
        .select('*')
        .eq('profile_id', user.id)
        .maybeSingle();

      if (profError) throw profError;
      
      if (!profData) {
        Alert.alert(
          t('common.error'),
          t('jobs.apply.errors.profileRequired'),
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
        return;
      }

      setProfessionalProfile(profData);

      // Pre-fill with job budget if available
      if (jobData.budget_max) {
        setProposedPrice(jobData.budget_max.toString());
      } else if (jobData.budget_min) {
        setProposedPrice(jobData.budget_min.toString());
      }
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert(t('common.error'), t('jobs.apply.errors.loadFailed'));
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!coverLetter.trim()) {
      Alert.alert(t('common.error'), t('jobs.apply.errors.coverLetterRequired'));
      return;
    }

    if (!proposedPrice.trim()) {
      Alert.alert(t('common.error'), t('jobs.apply.errors.rateRequired'));
      return;
    }

    try {
      setSubmitting(true);

      const applicationData = {
        job_posting_id: jobId,
        professional_profile_id: (professionalProfile as { id: string }).id,
        cover_letter: coverLetter.trim(),
        proposed_price: parseFloat(proposedPrice),
        status: 'pending',
      };

      const { error } = await supabase
        .from('job_applications')
        .insert([applicationData])
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          Alert.alert(
            t('jobs.apply.alreadyApplied.title'),
            t('jobs.apply.alreadyApplied.message')
          );
          navigation.goBack();
          return;
        }
        throw error;
      }

      Alert.alert(
        t('jobs.apply.success.title'),
        t('jobs.apply.success.message'),
        [
          {
            text: t('jobs.apply.success.viewJob'),
            onPress: () => {
              navigation.replace('JobDetail', { jobId });
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error submitting application:', error);
      Alert.alert(t('common.error'), t('jobs.apply.errors.submitFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Screen safe className="bg-gray-50">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      </Screen>
    );
  }

  if (!job || !professionalProfile) return null;

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
              {t('jobs.apply.title')}
            </Text>
          </View>

          <Text variant="body" color="muted" className="mb-6">
            {t('jobs.apply.sendProposal', { name: job.profiles?.full_name })}
          </Text>

          {/* Job Summary */}
          <Card variant="outlined" className="mb-6 p-4">
            <Text variant="h4" weight="bold" className="mb-2">
              {job.title}
            </Text>
            <Text variant="body" color="muted" numberOfLines={2}>
              {job.description}
            </Text>
            {job.budget_min && job.budget_max && (
              <Text variant="caption" color="muted" className="mt-2">
                {t('jobs.apply.budgetLabel')} {formatCurrency(job.budget_min)} - {formatCurrency(job.budget_max)}
              </Text>
            )}
          </Card>

          {/* Cover Letter */}
          <View className="mb-4">
            <Text variant="body" weight="medium" className="mb-2">
              {t('jobs.apply.coverLetter')} *
            </Text>
            <Input
              value={coverLetter}
              onChangeText={setCoverLetter}
              placeholder={t('jobs.apply.coverLetterPlaceholder')}
              multiline
              numberOfLines={8}
              maxLength={500}
            />
            <Text variant="caption" color="muted" className="mt-1">
              {t('jobs.apply.charactersCount', { count: coverLetter.length })}
            </Text>
            <Card variant="outlined" className="mt-2 p-3 bg-blue-50">
              <Text variant="caption" className="text-blue-600">
                {t('jobs.apply.coverLetterTip')}
              </Text>
            </Card>
          </View>

          {/* Proposed Price */}
          <View className="mb-6">
            <Text variant="body" weight="medium" className="mb-2">
              {t('jobs.apply.proposedRate')} *
            </Text>
            <Input
              value={proposedPrice}
              onChangeText={setProposedPrice}
              placeholder={t('jobs.apply.proposedRatePlaceholder')}
              keyboardType="numeric"
              leftIcon={<Text className="text-gray-500">$</Text>}
            />
            <Text variant="caption" color="muted" className="mt-1">
              {t('jobs.apply.proposedRateNote')}
              {job.budget_type === 'hourly' && t('jobs.apply.proposedRateHourly')}
              {job.budget_type === 'daily' && t('jobs.apply.proposedRateDaily')}
            </Text>
          </View>

          {/* Profile Preview */}
          <Card variant="outlined" className="mb-6 p-4">
            <Text variant="h4" weight="bold" className="mb-3">
              {t('jobs.apply.profilePreview')}
            </Text>
            <View className="space-y-2">
              <View className="flex-row">
                <Text variant="body" color="muted" className="w-24">
                  {t('jobs.apply.rating')}
                </Text>
                <Text variant="body" weight="medium">
                  {(professionalProfile as { average_rating?: number }).average_rating?.toFixed(1) || 'N/A'} ({(professionalProfile as { total_reviews?: number }).total_reviews || 0} {t('jobs.apply.reviews')})
                </Text>
              </View>
              <View className="flex-row">
                <Text variant="body" color="muted" className="w-24">
                  {t('jobs.apply.jobs')}
                </Text>
                <Text variant="body" weight="medium">
                  {(professionalProfile as { completed_bookings?: number }).completed_bookings || 0} {t('jobs.apply.completed')}
                </Text>
              </View>
              {(professionalProfile as { is_verified?: boolean }).is_verified && (
                <View className="flex-row items-center">
                  <Text variant="body" color="muted" className="w-24">
                    {t('jobs.apply.status')}
                  </Text>
                  <Text variant="body" weight="medium" className="text-blue-600">
                    {t('jobs.apply.verified')}
                  </Text>
                </View>
              )}
            </View>
          </Card>

          {/* Submit Button */}
          <Button
            variant="primary"
            size="lg"
            onPress={handleSubmit}
            loading={submitting}
            disabled={submitting || !coverLetter.trim() || !proposedPrice.trim()}
          >
            {t('jobs.apply.submit')}
          </Button>

          <Spacer size="xl" />
        </Container>
      </ScrollView>
    </Screen>
  );
}
