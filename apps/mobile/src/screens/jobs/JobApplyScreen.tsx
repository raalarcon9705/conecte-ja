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

export default function JobApplyScreen({ route, navigation }: any) {
  const { jobId } = route.params;
  const { t } = useTranslation();
  const { user } = useAuth();
  const supabase = useSupabase();

  const [job, setJob] = useState<any>(null);
  const [professionalProfile, setProfessionalProfile] = useState<any>(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [proposedPrice, setProposedPrice] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Fetch job details
      const { data: jobData, error: jobError } = await supabase
        .from('job_postings')
        .select('*, profiles!job_postings_client_profile_id_fkey(full_name)')
        .eq('id', jobId)
        .single();

      if (jobError) throw jobError;
      setJob(jobData);

      // Fetch professional profile
      const { data: profData, error: profError } = await supabase
        .from('professional_profiles')
        .select('*')
        .eq('profile_id', user?.id)
        .single();

      if (profError) throw profError;
      setProfessionalProfile(profData);

      // Pre-fill with job budget if available
      if (jobData.budget_max) {
        setProposedPrice(jobData.budget_max.toString());
      } else if (jobData.budget_min) {
        setProposedPrice(jobData.budget_min.toString());
      }
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'No se pudo cargar la información');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!coverLetter.trim()) {
      Alert.alert('Error', 'Por favor escribe una carta de presentación');
      return;
    }

    if (!proposedPrice.trim()) {
      Alert.alert('Error', 'Por favor ingresa tu tarifa propuesta');
      return;
    }

    try {
      setSubmitting(true);

      const applicationData = {
        job_posting_id: jobId,
        professional_profile_id: professionalProfile.id,
        cover_letter: coverLetter.trim(),
        proposed_price: parseFloat(proposedPrice),
        status: 'pending',
      };

      const { data, error } = await supabase
        .from('job_applications')
        .insert([applicationData])
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          Alert.alert('Ya postulaste', 'Ya has enviado una postulación para este trabajo');
          navigation.goBack();
          return;
        }
        throw error;
      }

      Alert.alert(
        '¡Postulación enviada!',
        'El cliente revisará tu propuesta y te contactará si está interesado.',
        [
          {
            text: 'Ver trabajo',
            onPress: () => {
              navigation.replace('JobDetail', { jobId });
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error submitting application:', error);
      Alert.alert('Error', 'No se pudo enviar tu postulación. Intenta nuevamente.');
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
              {t('jobs.apply.title', 'Postular al trabajo')}
            </Text>
          </View>

          <Text variant="body" color="muted" className="mb-6">
            Envía tu propuesta a {job.profiles?.full_name}
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
                Presupuesto: ${job.budget_min} - ${job.budget_max}
              </Text>
            )}
          </Card>

          {/* Cover Letter */}
          <View className="mb-4">
            <Text variant="body" weight="medium" className="mb-2">
              Carta de presentación *
            </Text>
            <Input
              value={coverLetter}
              onChangeText={setCoverLetter}
              placeholder="Cuéntale al cliente por qué eres la persona ideal para este trabajo. Destaca tu experiencia, habilidades y disponibilidad."
              multiline
              numberOfLines={8}
              maxLength={500}
            />
            <Text variant="caption" color="muted" className="mt-1">
              {coverLetter.length}/500 caracteres
            </Text>
            <Card variant="ghost" className="mt-2 p-3">
              <Text variant="caption" className="text-blue-600">
                💡 Tip: Menciona experiencias previas similares y tu disponibilidad específica
              </Text>
            </Card>
          </View>

          {/* Proposed Price */}
          <View className="mb-6">
            <Text variant="body" weight="medium" className="mb-2">
              Tu tarifa propuesta *
            </Text>
            <Input
              value={proposedPrice}
              onChangeText={setProposedPrice}
              placeholder="Ej: 5000"
              keyboardType="numeric"
              leftIcon={<Text className="text-gray-500">$</Text>}
            />
            <Text variant="caption" color="muted" className="mt-1">
              Ingresa la tarifa que cobrarías por este trabajo
              {job.budget_type === 'hourly' && ' (por hora)'}
              {job.budget_type === 'daily' && ' (por día)'}
            </Text>
          </View>

          {/* Profile Preview */}
          <Card variant="outlined" className="mb-6 p-4">
            <Text variant="h4" weight="bold" className="mb-3">
              Vista previa de tu perfil
            </Text>
            <View className="space-y-2">
              <View className="flex-row">
                <Text variant="body" color="muted" className="w-24">
                  Rating:
                </Text>
                <Text variant="body" weight="medium">
                  ⭐ {professionalProfile.average_rating?.toFixed(1) || 'N/A'} ({professionalProfile.total_reviews || 0} reseñas)
                </Text>
              </View>
              <View className="flex-row">
                <Text variant="body" color="muted" className="w-24">
                  Trabajos:
                </Text>
                <Text variant="body" weight="medium">
                  {professionalProfile.completed_bookings || 0} completados
                </Text>
              </View>
              {professionalProfile.is_verified && (
                <View className="flex-row items-center">
                  <Text variant="body" color="muted" className="w-24">
                    Estado:
                  </Text>
                  <Text variant="body" weight="medium" className="text-blue-600">
                    ✓ Verificado
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
            {t('jobs.apply.submit', 'Enviar postulación')}
          </Button>

          <Spacer size="xl" />
        </Container>
      </ScrollView>
    </Screen>
  );
}
