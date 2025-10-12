/** @jsxImportSource nativewind */
import React, { useState } from 'react';
import { View, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
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

export default function SearchScreen({ navigation }: any) {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [results, setResults] = useState<any[]>([]);

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
          {t('search.resultsCount', { count: results.length })}
        </Text>
      </Container>

      <ScrollView className="flex-1 px-4 mt-4">
        {results.length === 0 ? (
          <Empty
            icon={<Text className="text-6xl">🔍</Text>}
            title={t('search.empty.title')}
            description={t('search.empty.description')}
            action={{
              label: t('search.empty.action'),
              onPress: () => setSelectedFilters([]),
            }}
          />
        ) : (
          results.map((professional: any) => (
            <ProfessionalCard
              key={professional.id}
              {...professional}
              onPress={() =>
                navigation.navigate('ProfessionalDetail', {
                  id: professional.id,
                })
              }
              onFavorite={() => {}}
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

