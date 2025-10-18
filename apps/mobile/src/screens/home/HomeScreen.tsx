/** @jsxImportSource nativewind */
import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Wrench, Zap, Hammer, Sparkles, Paintbrush, Home, Scissors, Car, Construction, Package, ChevronRight, Briefcase } from 'lucide-react-native';
import {
  Screen,
  Text,
  SearchBar,
  CategoryCard,
  ProfessionalCard,
  Container,
  Spacer,
  Card,
  Divider,
  JobPostingCard,
} from '@conecteja/ui-mobile';
import { useCategories } from '../../contexts/CategoriesContext';
import { useProfessionals } from '../../contexts/ProfessionalsContext';
import { useAuth } from '../../contexts/AuthContext';
import { useFavorites } from '../../contexts/FavoritesContext';
import { useNotifications } from '../../contexts/NotificationsContext';
import { useProfile } from '../../contexts/ProfileContext';
import { useBookings } from '../../contexts/BookingsContext';
import { useJobPostings } from '../../contexts/JobPostingsContext';

// Icon mapping by category slug
const getCategoryIconBySlug = (slug: string, size: number, color: string) => {
  const iconMap: Record<string, React.ReactNode> = {
    'plomeria': <Wrench size={size} color={color} />,
    'plumbing': <Wrench size={size} color={color} />,
    'electricidad': <Zap size={size} color={color} />,
    'electricity': <Zap size={size} color={color} />,
    'carpinteria': <Hammer size={size} color={color} />,
    'carpentry': <Hammer size={size} color={color} />,
    'limpieza': <Sparkles size={size} color={color} />,
    'cleaning': <Sparkles size={size} color={color} />,
    'pintura': <Paintbrush size={size} color={color} />,
    'painting': <Paintbrush size={size} color={color} />,
    'hogar': <Home size={size} color={color} />,
    'home': <Home size={size} color={color} />,
    'belleza': <Scissors size={size} color={color} />,
    'beauty': <Scissors size={size} color={color} />,
    'automotriz': <Car size={size} color={color} />,
    'automotive': <Car size={size} color={color} />,
    'construccion': <Construction size={size} color={color} />,
    'construction': <Construction size={size} color={color} />,
  };
  
  return iconMap[slug] || <Package size={size} color={color} />;
};

interface HomeScreenProps {
  navigation: {
    navigate: (screen: string, params?: any) => void;
    goBack: () => void;
  };
}

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const { t } = useTranslation();
  const { user, currentMode } = useAuth();
  
  // Common contexts for both modes
  const { unreadCount, fetchNotifications } = useNotifications();
  const { profile, fetchProfile } = useProfile();
  const { bookings, fetchBookings } = useBookings();
  
  // Client mode only - Categories and Professionals search
  const { categories, loading: categoriesLoading } = useCategories();
  const { professionals, loading: professionalsLoading, fetchProfessionalsByCategory } = useProfessionals();
  const { favorites, fetchFavorites, toggleFavorite } = useFavorites();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  console.log("HomeScreen initialized");
  
  // Professional mode only - Job postings
  const { 
    featuredJobs, 
    loading: jobsLoading, 
    fetchFeaturedJobs,
    reactToJob 
  } = useJobPostings();

  // Initialize common contexts on mount
  useEffect(() => {
    if (user?.id) {
      fetchProfile(user.id);
      fetchNotifications(user.id);
      fetchBookings(user.id, currentMode);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, currentMode]);

  // Initialize client-specific data (favorites)
  useEffect(() => {
    if (user?.id && currentMode === 'client') {
      fetchFavorites(user.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, currentMode]);

  // Fetch featured jobs for professionals only
  useEffect(() => {
    if (user?.id && currentMode === 'professional' && profile?.professional_profile?.category_id) {
      console.log('Fetching featured jobs for category:', profile.professional_profile.category_id);
      fetchFeaturedJobs(profile.professional_profile.category_id, 3);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, currentMode, profile?.professional_profile?.category_id]);

  // Fetch professionals by category (client mode only)
  useEffect(() => {
    if (selectedCategory && currentMode === 'client') {
      fetchProfessionalsByCategory(selectedCategory);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, currentMode]);

  // Clear search state when switching to professional mode
  useEffect(() => {
    if (currentMode === 'professional') {
      setSearchQuery('');
      setSelectedCategory(null);
    }
  }, [currentMode]);

  const handleJobLike = async (jobId: string) => {
    try {
      await reactToJob(jobId, 'like');
    } catch {
      Alert.alert(
        t('common.error'),
        t('home.professional.errors.reactionFailed')
      );
    }
  };

  const getCategoryIcon = (slug: string, categoryColor: string | null, isActive: boolean) => {
    const iconColor = isActive ? '#ffffff' : (categoryColor || '#3b82f6');
    const iconSize = 24;
    return getCategoryIconBySlug(slug, iconSize, iconColor);
  };

  const handleCategoryPress = (categoryId: string) => {
    setSelectedCategory(selectedCategory === categoryId ? null : categoryId);
  };

  const userName = profile?.full_name?.split(' ')[0] || user?.user_metadata?.full_name?.split(' ')[0] || 'Usuario';

  // Render different content based on current mode
  if (currentMode === 'professional') {
    return (
      <Screen safe className="bg-gray-50">
        <ScrollView>
          <Container>
          <Text variant="h2" weight="bold" className="mb-2">
            {t('home.professional.greeting', { name: userName })}
          </Text>
          <Text variant="body" color="muted" className="mb-6">
            {t('home.professional.subtitle')}
          </Text>

          {/* Professional Dashboard Stats */}
          <View className="mb-6">
            <Text variant="h4" weight="bold" className="mb-4">
              {t('home.professional.stats.title')}
            </Text>
            <View className="flex-row justify-between gap-3">
              <Card variant="outlined" className="flex-1 p-4">
                <Text variant="h3" weight="bold" className="text-blue-500">
                  {bookings.filter(b => b.status === 'pending').length}
                </Text>
                <Text variant="caption" color="muted">
                  {t('home.professional.stats.pendingBookings')}
                </Text>
              </Card>
              <Card variant="outlined" className="flex-1 p-4">
                <Text variant="h3" weight="bold" className="text-green-500">
                  {unreadCount}
                </Text>
                <Text variant="caption" color="muted">
                  {t('home.professional.stats.unreadMessages')}
                </Text>
              </Card>
            </View>
          </View>

          {/* Featured Jobs Section */}
          <View className="mb-6">
            <View className="flex-row items-center justify-between mb-4">
              <Text variant="h4" weight="bold">
                {t('home.professional.availableJobs')}
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate('JobsList')}>
                <Text color="primary" weight="medium">
                  {t('home.viewAll')}
                </Text>
              </TouchableOpacity>
            </View>

            {jobsLoading ? (
              <View className="py-8 items-center">
                <ActivityIndicator size="large" color="#3b82f6" />
              </View>
            ) : featuredJobs.length === 0 ? (
              <Card variant="outlined" className="p-6">
                <View className="items-center">
                  <Briefcase size={48} color="#9ca3af" />
                  <Spacer size="md" />
                  <Text variant="body" color="muted" align="center" className="mb-2">
                    {t('home.professional.noJobs')}
                  </Text>
                  <Text variant="caption" color="muted" align="center">
                    {t('home.professional.checkBack')}
                  </Text>
                </View>
              </Card>
            ) : (
              featuredJobs.map((job) => (
                <JobPostingCard
                  key={job.id}
                  id={job.id}
                  title={job.title}
                  description={job.description}
                  clientName={job.profiles?.full_name || 'Usuario'}
                  clientAvatar={job.profiles?.avatar_url || undefined}
                  category={job.categories?.name || 'General'}
                  location={job.location_city || undefined}
                  budgetMin={job.budget_min || undefined}
                  budgetMax={job.budget_max || undefined}
                  budgetType={(job.budget_type as 'fixed' | 'hourly' | 'daily' | 'negotiable') || undefined}
                  startDate={job.start_date || undefined}
                  isRecurring={job.is_recurring || undefined}
                  likesCount={job.likes_count || 0}
                  dislikesCount={job.dislikes_count || 0}
                  applicationsCount={job.applications_count || 0}
                  createdAt={job.created_at || new Date().toISOString()}
                  onPress={() => navigation.navigate('JobDetail', { jobId: job.id })}
                  onLike={() => handleJobLike(job.id)}
                  onApply={() => navigation.navigate('JobApply', { jobId: job.id })}
                  showActions={true}
                />
              ))
            )}
          </View>

          {/* Quick Actions */}
          <View className="mb-6">
            <Text variant="h4" weight="bold" className="mb-4">
              {t('home.professional.quickActions')}
            </Text>
            <Card variant="outlined" padding="none">
              <TouchableOpacity
                className="flex-row items-center p-4 active:bg-gray-50"
                onPress={() => navigation.navigate('Bookings')}
              >
                <Text variant="body" weight="medium" className="flex-1">
                  {t('home.professional.actions.viewBookings')}
                </Text>
                <ChevronRight size={20} className="text-gray-400" />
              </TouchableOpacity>
              <Divider spacing="none" />
              <TouchableOpacity
                className="flex-row items-center p-4 active:bg-gray-50"
                onPress={() => navigation.navigate('Chats')}
              >
                <Text variant="body" weight="medium" className="flex-1">
                  {t('home.professional.actions.viewMessages')}
                </Text>
                <ChevronRight size={20} className="text-gray-400" />
              </TouchableOpacity>
              <Divider spacing="none" />
              <TouchableOpacity
                className="flex-row items-center p-4 active:bg-gray-50"
                onPress={() => navigation.navigate('Profile')}
              >
                <Text variant="body" weight="medium" className="flex-1">
                  {t('home.professional.actions.editProfile')}
                </Text>
                <ChevronRight size={20} className="text-gray-400" />
              </TouchableOpacity>
              <Divider spacing="none" />
              <TouchableOpacity
                className="flex-row items-center p-4 active:bg-gray-50"
                onPress={() => navigation.navigate('JobsList')}
              >
                <View className="flex-row items-center flex-1">
                  <Briefcase size={20} color="#3b82f6" />
                  <Text variant="body" weight="medium" className="ml-3">
                    {t('home.professional.actions.viewJobs', 'Ver trabajos disponibles')}
                  </Text>
                </View>
                <ChevronRight size={20} className="text-gray-400" />
              </TouchableOpacity>
            </Card>
          </View>

          {/* Recent Activity */}
          <View className="mb-6">
            <Text variant="h4" weight="bold" className="mb-4">
              {t('home.professional.recentActivity')}
            </Text>
            <Card variant="outlined" className="p-4">
              <Text variant="body" color="muted" align="center">
                {t('home.professional.noRecentActivity')}
              </Text>
            </Card>
          </View>
        </Container>
        </ScrollView>
      </Screen>
    );
  }

  // Client mode view
  return (
    <Screen safe className="bg-gray-50">
      <ScrollView>
        <Container>
          <Text variant="h2" weight="bold" className="mb-2">
            {t('home.greeting', { name: userName })}
          </Text>
          <Text variant="body" color="muted" className="mb-6">
            {t('home.question')}
          </Text>

          {/* Quick Access Card for Clients */}
          <Card variant="outlined" className="mb-6">
            <TouchableOpacity
              className="flex-row items-center p-4 active:bg-gray-50"
              onPress={() => navigation.navigate('JobsList')}
            >
              <View className="w-12 h-12 bg-blue-50 rounded-full items-center justify-center">
                <Briefcase size={24} color="#3b82f6" />
              </View>
              <View className="flex-1 ml-4">
                <Text variant="body" weight="bold" className="mb-1">
                  {t('home.client.postJob', 'Publicar trabajo')}
                </Text>
                <Text variant="caption" color="muted">
                  {t('home.client.postJobDesc', 'Encuentra profesionales para tu necesidad')}
                </Text>
              </View>
              <ChevronRight size={20} color="#9ca3af" />
            </TouchableOpacity>
          </Card>

          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder={t('home.searchPlaceholder')}
            showFilter
            onFilterPress={() => navigation.navigate('Search')}
          />

          <Spacer size="lg" />

          <Text variant="h4" weight="bold" className="mb-4">
            {t('home.categories')}
          </Text>

          {categoriesLoading ? (
            <View className="py-8 items-center">
              <ActivityIndicator size="large" color="#3b82f6" />
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mb-6"
            >
              {categories.map((category) => {
                const isActive = selectedCategory === category.id;
                return (
                  <CategoryCard
                    key={category.id}
                    id={category.id}
                    name={category.name}
                    icon={getCategoryIcon(category.slug, category.color, isActive)}
                    isActive={isActive}
                    onPress={() => handleCategoryPress(category.id)}
                  />
                );
              })}
            </ScrollView>
          )}

          <View className="flex-row items-center justify-between mb-4">
            <Text variant="h4" weight="bold">
              {t('home.nearYou')}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Search')}>
              <Text color="primary" weight="medium">
                {t('home.viewAll')}
              </Text>
            </TouchableOpacity>
          </View>

          {professionalsLoading ? (
            <View className="py-8 items-center">
              <ActivityIndicator size="large" color="#3b82f6" />
            </View>
          ) : professionals.length === 0 ? (
            <View className="py-12 items-center">
              <Text variant="body" color="muted" className="text-center">
                {t('home.noProfessionals')}
              </Text>
            </View>
          ) : (
            professionals
              .filter(prof => prof.id && prof.profiles?.full_name) // Filter out invalid entries
              .map((professional) => (
                <ProfessionalCard
                  key={professional.id}
                  id={professional.id!}
                  name={professional.profiles?.full_name || 'Sin nombre'}
                  category={professional.categories?.name || 'Sin categoría'}
                  avatar={professional.profiles?.avatar_url || undefined}
                  rating={Number(professional.average_rating) || 0}
                  reviewCount={professional.total_reviews || 0}
                  distance={0} // Will be calculated with user location
                  isPremium={professional.subscription_plan?.slug === 'premium'}
                  isVerified={professional.is_verified || false}
                  price={professional.price_range || ''}
                  description={professional.tagline || professional.description || ''}
                  onPress={() =>
                    navigation.navigate('ProfessionalDetail', { id: professional.id })
                  }
                  onFavorite={() => toggleFavorite(professional.id!)}
                  isFavorite={favorites.includes(professional.id!)}
                />
              ))
          )}

          <Spacer size="xl" />
        </Container>
      </ScrollView>
    </Screen>
  );
}

