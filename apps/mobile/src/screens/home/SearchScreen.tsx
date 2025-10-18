/** @jsxImportSource nativewind */
import React, { useState, useEffect } from 'react';
import { View, ScrollView, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Search as SearchIcon, Briefcase } from 'lucide-react-native';
import {
  Screen,
  Text,
  SearchBar,
  FilterChip,
  ProfessionalCard,
  JobPostingCard,
  Container,
  Spacer,
  Empty,
  Modal,
  Button,
  Divider,
} from '@conecteja/ui-mobile';
import { useProfessionals } from '../../contexts/ProfessionalsContext';
import { useFavorites } from '../../contexts/FavoritesContext';
import { useAuth } from '../../contexts/AuthContext';
import { useSupabase } from '../../hooks/useSupabase';

export default function SearchScreen({ navigation }: any) {
  const { t } = useTranslation();
  const { user, currentMode } = useAuth();
  const supabase = useSupabase();
  
  // Client mode: professionals search
  const { professionals, loading: professionalsLoading } = useProfessionals();
  const { favorites, toggleFavorite, fetchFavorites } = useFavorites();
  
  // Professional mode: jobs search
  const [jobs, setJobs] = useState<any[]>([]);
  const [jobsLoading, setJobsLoading] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [showFilterModal, setShowFilterModal] = useState(false);

  // Fetch favorites for client mode
  useEffect(() => {
    if (user?.id && currentMode === 'client') {
      fetchFavorites(user.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, currentMode]);

  // Fetch jobs for professional mode
  useEffect(() => {
    if (currentMode === 'professional') {
      fetchJobs();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentMode]);

  // Clear filters when switching modes
  useEffect(() => {
    setSearchQuery('');
    setSelectedFilters([]);
  }, [currentMode]);

  const fetchJobs = async () => {
    try {
      setJobsLoading(true);
      const { data, error } = await supabase
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

      if (error) throw error;
      console.log('Jobs fetched in SearchScreen:', data?.length || 0, 'jobs');
      setJobs(data || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setJobsLoading(false);
    }
  };

  // Filter professionals based on search query and filters (Client mode)
  const filteredProfessionals = professionals.filter((prof) => {
    const matchesSearch = !searchQuery || 
      prof.profiles?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prof.categories?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prof.business_name?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesVerified = !selectedFilters.includes('verified') || prof.is_verified;
    const matchesPremium = !selectedFilters.includes('premium') || prof.subscription_plan?.slug === 'premium';

    return matchesSearch && matchesVerified && matchesPremium;
  });

  // Filter jobs based on search query and filters (Professional mode)
  const filteredJobs = jobs.filter((job) => {
    const matchesSearch = !searchQuery ||
      job.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.categories?.name?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRecurring = !selectedFilters.includes('recurring') || job.is_recurring;
    const matchesBudget = !selectedFilters.includes('withBudget') || (job.budget_min || job.budget_max);

    return matchesSearch && matchesRecurring && matchesBudget;
  });

  // Filters for client mode (search professionals)
  const clientFilters = [
    { id: 'verified', label: t('search.filters.verified'), count: 45 },
    { id: 'premium', label: t('search.filters.premium'), count: 23 },
    { id: 'distance', label: t('search.filters.nearMe') },
    { id: 'rating', label: t('search.filters.rating') },
  ];

  // Filters for professional mode (search jobs)
  const professionalFilters = [
    { id: 'recurring', label: 'Recurrentes' },
    { id: 'withBudget', label: 'Con presupuesto' },
    { id: 'recent', label: 'Recientes' },
  ];

  const filters = currentMode === 'client' ? clientFilters : professionalFilters;
  const loading = currentMode === 'client' ? professionalsLoading : jobsLoading;
  const resultsCount = currentMode === 'client' ? filteredProfessionals.length : filteredJobs.length;

  const toggleFilter = (filterId: string) => {
    setSelectedFilters((prev) =>
      prev.includes(filterId)
        ? prev.filter((id) => id !== filterId)
        : [...prev, filterId]
    );
  };

  const handleJobLike = async (jobId: string) => {
    // Implement reaction logic
    console.log('Like job:', jobId);
  };

  return (
    <Screen safe className="bg-gray-50">
      <Container>
        <Text variant="h2" weight="bold" className="mb-6">
          {currentMode === 'client' 
            ? t('search.title') 
            : t('jobs.available.title', 'Buscar Trabajos')}
        </Text>

        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder={currentMode === 'client' 
            ? t('search.placeholder')
            : 'Buscar trabajos...'}
          showFilter
          onFilterPress={() => setShowFilterModal(true)}
          onSearch={(text) => console.log('Searching:', text)}
        />

        <Spacer size="md" />

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {filters.map((filter) => (
            <FilterChip
              key={filter.id}
              label={filter.label}
              count={'count' in filter ? (filter.count as number) : undefined}
              isActive={selectedFilters.includes(filter.id)}
              onPress={() => toggleFilter(filter.id)}
            />
          ))}
        </ScrollView>

        <Spacer size="md" />

        <Text variant="caption" color="muted">
          {t('search.resultsCount', { count: resultsCount })}
        </Text>
      </Container>

      <ScrollView className="flex-1 px-4 mt-4">
        {loading ? (
          <View className="py-12 items-center">
            <ActivityIndicator size="large" color="#3B82F6" />
          </View>
        ) : currentMode === 'client' ? (
          // CLIENT MODE: Show professionals
          filteredProfessionals.length === 0 ? (
            <Empty
              icon={<SearchIcon size={64} color="#9CA3AF" />}
              title={t('search.empty.title')}
              description={t('search.empty.description')}
              action={{
                label: t('search.empty.action'),
                onPress: () => {
                  setSearchQuery('');
                  setSelectedFilters([]);
                },
              }}
            />
          ) : (
            filteredProfessionals
              .filter(prof => prof.id && prof.profiles?.full_name)
              .map((professional) => (
                <ProfessionalCard
                  key={professional.id}
                  id={professional.id!}
                  name={professional.profiles?.full_name || 'Sin nombre'}
                  category={professional.categories?.name || 'Sin categoría'}
                  avatar={professional.profiles?.avatar_url || undefined}
                  rating={Number(professional.average_rating) || 0}
                  reviewCount={professional.total_reviews || 0}
                  distance={0}
                  isPremium={professional.subscription_plan?.slug === 'premium'}
                  isVerified={professional.is_verified || false}
                  price={professional.price_range || ''}
                  description={professional.tagline || professional.description || ''}
                  onPress={() =>
                    navigation.navigate('ProfessionalDetail', {
                      id: professional.id,
                    })
                  }
                  onFavorite={() => toggleFavorite(professional.id!)}
                  isFavorite={favorites.includes(professional.id!)}
                />
              ))
          )
        ) : (
          // PROFESSIONAL MODE: Show jobs
          filteredJobs.length === 0 ? (
            <Empty
              icon={<Briefcase size={64} color="#9CA3AF" />}
              title="No hay trabajos disponibles"
              description="Intenta ajustar los filtros o vuelve más tarde"
              action={{
                label: 'Limpiar filtros',
                onPress: () => {
                  setSearchQuery('');
                  setSelectedFilters([]);
                },
              }}
            />
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
                onLike={() => handleJobLike(job.id)}
                onApply={() => navigation.navigate('JobApply', { jobId: job.id })}
                showActions={true}
              />
            ))
          )
        )}
      </ScrollView>

      <Modal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        position="bottom"
      >
        <Text variant="h3" weight="bold" className="mb-6">
          {currentMode === 'client' 
            ? t('search.filterModal.title')
            : 'Filtros de Trabajos'}
        </Text>

        {currentMode === 'client' ? (
          // CLIENT FILTERS
          <>
            <Text variant="body" weight="medium" className="mb-3">
              {t('search.filterModal.maxDistance')}
            </Text>
            <View className="mb-6">
              {/* TODO: Add distance slider */}
              <Text color="muted">5 km</Text>
            </View>

            <Divider />

            <Text variant="body" weight="medium" className="my-3">
              {t('search.filterModal.minRating')}
            </Text>
            <View className="mb-6">
              {/* TODO: Add rating selector */}
              <Text color="muted">4+ estrellas</Text>
            </View>

            <Divider />

            <Text variant="body" weight="medium" className="my-3">
              {t('search.filterModal.price')}
            </Text>
            <View className="mb-6">
              {/* TODO: Add price range selector */}
              <Text color="muted">$0 - $200</Text>
            </View>
          </>
        ) : (
          // PROFESSIONAL FILTERS
          <>
            <Text variant="body" weight="medium" className="mb-3">
              Rango de presupuesto
            </Text>
            <View className="mb-6">
              {/* TODO: Add budget range selector */}
              <Text color="muted">Cualquier presupuesto</Text>
            </View>

            <Divider />

            <Text variant="body" weight="medium" className="my-3">
              Tipo de trabajo
            </Text>
            <View className="mb-6">
              {/* TODO: Add job type selector */}
              <Text color="muted">Único o Recurrente</Text>
            </View>

            <Divider />

            <Text variant="body" weight="medium" className="my-3">
              Distancia máxima
            </Text>
            <View className="mb-6">
              {/* TODO: Add distance slider */}
              <Text color="muted">10 km</Text>
            </View>
          </>
        )}

        <Button variant="primary" fullWidth onPress={() => setShowFilterModal(false)}>
          {t('search.filterModal.apply')}
        </Button>
      </Modal>
    </Screen>
  );
}

