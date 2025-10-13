/** @jsxImportSource nativewind */
import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Plus, Briefcase, ArrowLeft } from 'lucide-react-native';
import {
  Screen,
  Text,
  SearchBar,
  JobPostingCard,
  Container,
  Spacer,
  FilterChip,
  Button,
} from '@conecteja/ui-mobile';
import { useAuth } from '../../contexts/AuthContext';
import { useSupabase } from '../../hooks/useSupabase';

export default function JobsListScreen({ navigation }: any) {
  const { t } = useTranslation();
  const { user, currentMode } = useAuth();
  const supabase = useSupabase();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    fetchJobs();
  }, [selectedCategory]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('job_postings')
        .select(`
          *,
          profiles!job_postings_client_profile_id_fkey (
            id,
            full_name,
            avatar_url
          ),
          categories (
            id,
            name
          )
        `)
        .eq('status', 'open')
        .order('created_at', { ascending: false });

      if (selectedCategory) {
        query = query.eq('category_id', selectedCategory);
      }

      const { data, error } = await query;

      if (error) throw error;
      setJobs(data || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (jobId: string) => {
    // TODO: Implement reaction logic
    console.log('Like job:', jobId);
  };

  const handleApply = (jobId: string) => {
    navigation.navigate('JobApply', { jobId });
  };

  const filteredJobs = jobs.filter(job =>
    job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Screen safe className="bg-gray-50">
      <Container>
        {/* Header */}
        <View className="flex-row items-center mb-6">
          <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
            <ArrowLeft size={24} color="#374151" />
          </TouchableOpacity>
          <View className="flex-1">
            <Text variant="h3" weight="bold">
              {currentMode === 'client'
                ? t('jobs.myJobs.title', 'Mis Trabajos')
                : t('jobs.available.title', 'Trabajos Disponibles')}
            </Text>
          </View>

          {currentMode === 'client' && (
            <TouchableOpacity
              className="w-12 h-12 bg-blue-600 rounded-full items-center justify-center"
              onPress={() => navigation.navigate('CreateJob')}
            >
              <Plus size={24} color="#ffffff" />
            </TouchableOpacity>
          )}
        </View>

        <Text variant="body" color="muted" className="mb-4">
          {currentMode === 'client'
            ? t('jobs.myJobs.subtitle', 'Gestiona tus publicaciones')
            : t('jobs.available.subtitle', 'Encuentra tu próximo trabajo')}
        </Text>

        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder={t('jobs.searchPlaceholder', 'Buscar trabajos...')}
          showFilter
          onFilterPress={() => {}}
        />

        <Spacer size="md" />

        {/* Category Filters - TODO: Load from categories */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-4"
        >
          <FilterChip
            label={t('jobs.filters.all', 'Todos')}
            active={!selectedCategory}
            onPress={() => setSelectedCategory(null)}
          />
          <FilterChip
            label={t('jobs.filters.cleaning', 'Limpieza')}
            active={false}
            onPress={() => {}}
          />
          <FilterChip
            label={t('jobs.filters.nanny', 'Niñera')}
            active={false}
            onPress={() => {}}
          />
          <FilterChip
            label={t('jobs.filters.helper', 'Auxiliar')}
            active={false}
            onPress={() => {}}
          />
        </ScrollView>
      </Container>

      <ScrollView className="flex-1 px-4">
        {loading ? (
          <View className="py-12 items-center">
            <ActivityIndicator size="large" color="#3b82f6" />
          </View>
        ) : filteredJobs.length === 0 ? (
          <View className="py-12 items-center">
            <Briefcase size={48} color="#d1d5db" />
            <Text variant="body" color="muted" className="text-center mt-4">
              {currentMode === 'client'
                ? t('jobs.myJobs.empty', 'No tienes trabajos publicados')
                : t('jobs.available.empty', 'No hay trabajos disponibles')}
            </Text>
            {currentMode === 'client' && (
              <Button
                variant="primary"
                size="md"
                className="mt-4"
                onPress={() => navigation.navigate('CreateJob')}
              >
                {t('jobs.createFirst', 'Publicar primer trabajo')}
              </Button>
            )}
          </View>
        ) : (
          filteredJobs.map((job) => (
            <JobPostingCard
              key={job.id}
              id={job.id}
              title={job.title}
              description={job.description}
              clientName={job.profiles?.full_name || 'Usuario'}
              clientAvatar={job.profiles?.avatar_url}
              category={job.categories?.name || 'General'}
              location={job.location_city}
              budgetMin={job.budget_min}
              budgetMax={job.budget_max}
              budgetType={job.budget_type}
              startDate={job.start_date}
              isRecurring={job.is_recurring}
              likesCount={job.likes_count || 0}
              dislikesCount={job.dislikes_count || 0}
              applicationsCount={job.applications_count || 0}
              createdAt={job.created_at}
              onPress={() => navigation.navigate('JobDetail', { jobId: job.id })}
              onLike={() => handleLike(job.id)}
              onApply={() => handleApply(job.id)}
              showActions={currentMode === 'professional'}
            />
          ))
        )}
      </ScrollView>
    </Screen>
  );
}
