/** @jsxImportSource nativewind */
import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import {
  MapPin,
  Calendar,
  DollarSign,
  ThumbsUp,
  ThumbsDown,
  Clock,
  Users,
  MessageCircle,
  ArrowLeft,
} from 'lucide-react-native';
import {
  Screen,
  Text,
  Button,
  Container,
  Spacer,
  Card,
  Avatar,
  Badge,
  Divider,
  LocationMap,
  NavigationButtons,
} from '@conecteja/ui-mobile';
import { useAuth } from '../../contexts/AuthContext';
import { useSupabase } from '../../hooks/useSupabase';
import { LocationPrivacy } from '../../utils/geolocation';

export default function JobDetailScreen({ route, navigation }: any) {
  const { jobId } = route.params;
  const { t } = useTranslation();
  const { user, currentMode } = useAuth();
  const supabase = useSupabase();

  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userReaction, setUserReaction] = useState<'like' | 'dislike' | null>(null);
  const [hasApplied, setHasApplied] = useState(false);
  const [applications, setApplications] = useState<any[]>([]);

  useEffect(() => {
    fetchJobDetail();
    if (currentMode === 'professional') {
      checkUserReaction();
      checkIfApplied();
    }
    if (currentMode === 'client') {
      fetchApplications();
    }
  }, [jobId]);

  const fetchJobDetail = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('job_postings')
        .select(`
          *,
          profiles!job_postings_client_profile_id_fkey (
            id,
            full_name,
            avatar_url,
            phone
          ),
          categories (
            id,
            name
          )
        `)
        .eq('id', jobId)
        .single();

      if (error) throw error;
      setJob(data);
    } catch (error) {
      console.error('Error fetching job:', error);
      Alert.alert('Error', 'No se pudo cargar el trabajo');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const checkUserReaction = async () => {
    try {
      const { data: professionalProfile } = await supabase
        .from('professional_profiles')
        .select('id')
        .eq('profile_id', user?.id)
        .single();

      if (!professionalProfile) return;

      const { data } = await supabase
        .from('job_posting_reactions')
        .select('reaction_type')
        .eq('job_posting_id', jobId)
        .eq('professional_profile_id', professionalProfile.id)
        .single();

      if (data) {
        setUserReaction(data.reaction_type);
      }
    } catch (error) {
      console.error('Error checking reaction:', error);
    }
  };

  const checkIfApplied = async () => {
    try {
      const { data: professionalProfile } = await supabase
        .from('professional_profiles')
        .select('id')
        .eq('profile_id', user?.id)
        .single();

      if (!professionalProfile) return;

      const { data } = await supabase
        .from('job_applications')
        .select('id')
        .eq('job_posting_id', jobId)
        .eq('professional_profile_id', professionalProfile.id)
        .single();

      setHasApplied(!!data);
    } catch (error) {
      console.error('Error checking application:', error);
    }
  };

  const fetchApplications = async () => {
    try {
      const { data, error } = await supabase
        .from('job_applications')
        .select(`
          *,
          professional_profiles!job_applications_professional_profile_id_fkey (
            id,
            profiles!professional_profiles_profile_id_fkey (
              id,
              full_name,
              avatar_url
            )
          )
        `)
        .eq('job_posting_id', jobId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
  };

  const handleReaction = async (reactionType: 'like' | 'dislike') => {
    try {
      const { data: professionalProfile } = await supabase
        .from('professional_profiles')
        .select('id')
        .eq('profile_id', user?.id)
        .single();

      if (!professionalProfile) {
        Alert.alert('Error', 'Necesitas un perfil profesional para reaccionar');
        return;
      }

      if (userReaction === reactionType) {
        // Remove reaction
        await supabase
          .from('job_posting_reactions')
          .delete()
          .eq('job_posting_id', jobId)
          .eq('professional_profile_id', professionalProfile.id);
        setUserReaction(null);
      } else {
        // Add or update reaction
        await supabase
          .from('job_posting_reactions')
          .upsert({
            job_posting_id: jobId,
            professional_profile_id: professionalProfile.id,
            reaction_type: reactionType,
          });
        setUserReaction(reactionType);
      }

      fetchJobDetail(); // Refresh counts
    } catch (error) {
      console.error('Error handling reaction:', error);
      Alert.alert('Error', 'No se pudo registrar tu reacción');
    }
  };

  const handleApply = () => {
    navigation.navigate('JobApply', { jobId });
  };

  const handleContactClient = () => {
    navigation.navigate('ChatDetail', { userId: job.client_profile_id });
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

  if (!job) return null;

  const isOwner = job.client_profile_id === user?.id;
  const showLocation = isOwner || hasApplied;

  return (
    <Screen safe className="bg-gray-50">
      <ScrollView>
        <Container>
          {/* Header with Back Button */}
          <View className="flex-row items-center mb-6">
            <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
              <ArrowLeft size={24} color="#374151" />
            </TouchableOpacity>
            <Text variant="h3" weight="bold" className="flex-1">
              {t('jobs.detail.title', 'Detalle del Trabajo')}
            </Text>
          </View>

          {/* Job Header */}
          <View className="flex-row items-start mb-4">
            <Avatar
              source={job.profiles?.avatar_url ? { uri: job.profiles.avatar_url } : undefined}
              name={job.profiles?.full_name || 'Usuario'}
              size="lg"
            />
            <View className="flex-1 ml-3">
              <Text variant="h3" weight="bold" className="mb-1">
                {job.profiles?.full_name || 'Usuario'}
              </Text>
              <View className="flex-row items-center">
                <Clock size={14} color="#6b7280" />
                <Text variant="caption" color="muted" className="ml-1">
                  Publicado {new Date(job.created_at).toLocaleDateString('es-AR')}
                </Text>
              </View>
            </View>
            <Badge variant="info">{job.categories?.name || 'General'}</Badge>
          </View>

          {/* Title */}
          <Text variant="h2" weight="bold" className="mb-3">
            {job.title}
          </Text>

          {/* Description */}
          <Card variant="outlined" className="mb-4 p-4">
            <Text variant="body" className="text-gray-700 leading-6">
              {job.description}
            </Text>
          </Card>

          {/* Job Details */}
          <Card variant="outlined" className="mb-4">
            <View className="p-4">
              <Text variant="h4" weight="bold" className="mb-3">
                Detalles del trabajo
              </Text>

              {job.location_city && (
                <View className="flex-row items-center mb-3">
                  <MapPin size={20} color="#6b7280" />
                  <Text variant="body" className="ml-3 flex-1">
                    {job.location_city}
                  </Text>
                </View>
              )}

              {job.start_date && (
                <View className="flex-row items-center mb-3">
                  <Calendar size={20} color="#6b7280" />
                  <Text variant="body" className="ml-3 flex-1">
                    Inicia: {new Date(job.start_date).toLocaleDateString('es-AR')}
                    {job.is_recurring && ' (Recurrente)'}
                  </Text>
                </View>
              )}

              <View className="flex-row items-center">
                <DollarSign size={20} color="#10b981" />
                <Text variant="body" weight="semibold" className="ml-3 text-green-600">
                  {job.budget_min && job.budget_max
                    ? `$${job.budget_min} - $${job.budget_max}`
                    : job.budget_min
                    ? `Desde $${job.budget_min}`
                    : 'A negociar'}
                  {job.budget_type === 'hourly' && ' /hora'}
                  {job.budget_type === 'daily' && ' /día'}
                </Text>
              </View>
            </View>
          </Card>

          {/* Map */}
          {job.location_latitude && job.location_longitude && (
            <View className="mb-4">
              <Text variant="h4" weight="bold" className="mb-3">
                Ubicación
              </Text>
              <LocationMap
                latitude={job.location_latitude}
                longitude={job.location_longitude}
                privacy={showLocation ? LocationPrivacy.EXACT : LocationPrivacy.APPROXIMATE}
                radius={1000}
              />
              {!showLocation && (
                <Text variant="caption" color="muted" className="mt-2">
                  La ubicación exacta se mostrará después de postularte
                </Text>
              )}
              {showLocation && job.location_latitude && job.location_longitude && (
                <NavigationButtons
                  latitude={job.location_latitude}
                  longitude={job.location_longitude}
                  className="mt-3"
                />
              )}
            </View>
          )}

          {/* Stats */}
          <Card variant="outlined" className="mb-4">
            <View className="p-4 flex-row justify-around">
              <View className="items-center">
                <View className="flex-row items-center mb-1">
                  <ThumbsUp size={18} color="#10b981" />
                  <Text variant="h4" weight="bold" className="ml-2">
                    {job.likes_count || 0}
                  </Text>
                </View>
                <Text variant="caption" color="muted">Me gusta</Text>
              </View>

              <View className="items-center">
                <View className="flex-row items-center mb-1">
                  <Users size={18} color="#3b82f6" />
                  <Text variant="h4" weight="bold" className="ml-2">
                    {job.applications_count || 0}
                  </Text>
                </View>
                <Text variant="caption" color="muted">Postulaciones</Text>
              </View>
            </View>
          </Card>

          {/* Applications (for client) */}
          {isOwner && applications.length > 0 && (
            <View className="mb-4">
              <Text variant="h4" weight="bold" className="mb-3">
                Postulaciones ({applications.length})
              </Text>
              {applications.map((app) => (
                <Card key={app.id} variant="outlined" className="mb-2 p-4">
                  <View className="flex-row items-center">
                    <Avatar
                      source={app.professional_profiles?.profiles?.avatar_url
                        ? { uri: app.professional_profiles.profiles.avatar_url }
                        : undefined}
                      name={app.professional_profiles?.profiles?.full_name || 'Profesional'}
                      size="md"
                    />
                    <View className="flex-1 ml-3">
                      <Text variant="body" weight="bold">
                        {app.professional_profiles?.profiles?.full_name || 'Profesional'}
                      </Text>
                      {app.proposed_price && (
                        <Text variant="caption" color="muted">
                          Propuesta: ${app.proposed_price}
                        </Text>
                      )}
                    </View>
                    <TouchableOpacity
                      className="bg-blue-600 px-4 py-2 rounded-lg"
                      onPress={() => navigation.navigate('ApplicationDetail', { applicationId: app.id })}
                    >
                      <Text className="text-white font-medium">Ver</Text>
                    </TouchableOpacity>
                  </View>
                </Card>
              ))}
            </View>
          )}

          {/* Actions */}
          {!isOwner && currentMode === 'professional' && (
            <View className="gap-3 mb-6">
              {/* Reaction Buttons */}
              <View className="flex-row gap-3">
                <TouchableOpacity
                  className={`flex-1 flex-row items-center justify-center py-3 px-4 rounded-lg border ${
                    userReaction === 'like'
                      ? 'bg-green-50 border-green-500'
                      : 'bg-white border-gray-200'
                  }`}
                  onPress={() => handleReaction('like')}
                >
                  <ThumbsUp
                    size={20}
                    color={userReaction === 'like' ? '#10b981' : '#6b7280'}
                    fill={userReaction === 'like' ? '#10b981' : 'none'}
                  />
                  <Text className={`ml-2 font-medium ${
                    userReaction === 'like' ? 'text-green-600' : 'text-gray-600'
                  }`}>
                    Me interesa
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className={`flex-1 flex-row items-center justify-center py-3 px-4 rounded-lg border ${
                    userReaction === 'dislike'
                      ? 'bg-red-50 border-red-500'
                      : 'bg-white border-gray-200'
                  }`}
                  onPress={() => handleReaction('dislike')}
                >
                  <ThumbsDown
                    size={20}
                    color={userReaction === 'dislike' ? '#ef4444' : '#6b7280'}
                    fill={userReaction === 'dislike' ? '#ef4444' : 'none'}
                  />
                  <Text className={`ml-2 font-medium ${
                    userReaction === 'dislike' ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    No me interesa
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Apply Button */}
              <Button
                variant="primary"
                size="lg"
                onPress={handleApply}
                disabled={hasApplied}
              >
                {hasApplied ? 'Ya postulaste' : 'Postular a este trabajo'}
              </Button>

              {hasApplied && (
                <Button
                  variant="outline"
                  size="lg"
                  leftIcon={<MessageCircle size={20} color="#3b82f6" />}
                  onPress={handleContactClient}
                >
                  Contactar cliente
                </Button>
              )}
            </View>
          )}

          <Spacer size="xl" />
        </Container>
      </ScrollView>
    </Screen>
  );
}
