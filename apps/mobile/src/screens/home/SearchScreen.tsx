/** @jsxImportSource nativewind */
import React, { useState, useEffect } from 'react';
import { View, ScrollView, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Search as SearchIcon } from 'lucide-react-native';
import {
  Screen,
  Text,
  SearchBar,
  FilterChip,
  ProfessionalCard,
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

export default function SearchScreen({ navigation }: any) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { professionals, loading } = useProfessionals();
  const { favorites, toggleFavorite, fetchFavorites } = useFavorites();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [showFilterModal, setShowFilterModal] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchFavorites(user.id);
    }
  }, [user]);

  // Filter professionals based on search query and filters
  const filteredProfessionals = professionals.filter((prof) => {
    const matchesSearch = !searchQuery || 
      prof.profiles?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prof.categories?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prof.business_name?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesVerified = !selectedFilters.includes('verified') || prof.is_verified;
    const matchesPremium = !selectedFilters.includes('premium') || prof.subscription_plan?.slug === 'premium';

    return matchesSearch && matchesVerified && matchesPremium;
  });

  const filters = [
    { id: 'verified', label: t('search.filters.verified'), count: 45 },
    { id: 'premium', label: t('search.filters.premium'), count: 23 },
    { id: 'distance', label: t('search.filters.nearMe') },
    { id: 'rating', label: t('search.filters.rating') },
  ];

  const toggleFilter = (filterId: string) => {
    setSelectedFilters((prev) =>
      prev.includes(filterId)
        ? prev.filter((id) => id !== filterId)
        : [...prev, filterId]
    );
  };

  return (
    <Screen safe className="bg-gray-50">
      <Container>
        <Text variant="h2" weight="bold" className="mb-6">
          {t('search.title')}
        </Text>

        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder={t('search.placeholder')}
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
              count={filter.count}
              isActive={selectedFilters.includes(filter.id)}
              onPress={() => toggleFilter(filter.id)}
            />
          ))}
        </ScrollView>

        <Spacer size="md" />

        <Text variant="caption" color="muted">
          {t('search.resultsCount', { count: filteredProfessionals.length })}
        </Text>
      </Container>

      <ScrollView className="flex-1 px-4 mt-4">
        {loading ? (
          <View className="py-12 items-center">
            <ActivityIndicator size="large" color="#3B82F6" />
          </View>
        ) : filteredProfessionals.length === 0 ? (
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
        )}
      </ScrollView>

      <Modal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        position="bottom"
      >
        <Text variant="h3" weight="bold" className="mb-6">
          {t('search.filterModal.title')}
        </Text>

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

        <Button variant="primary" fullWidth onPress={() => setShowFilterModal(false)}>
          {t('search.filterModal.apply')}
        </Button>
      </Modal>
    </Screen>
  );
}

