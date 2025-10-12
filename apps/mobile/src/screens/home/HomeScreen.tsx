/** @jsxImportSource nativewind */
import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import {
  Screen,
  Text,
  SearchBar,
  CategoryCard,
  ProfessionalCard,
  Container,
  Spacer,
} from '@conecteja/ui-mobile';

const nearbyProfessionals = [
  {
    id: '1',
    name: 'Juan Pérez',
    category: 'Plomero',
    avatar: undefined,
    rating: 4.8,
    reviewCount: 156,
    distance: 1.2,
    isPremium: true,
    isVerified: true,
    price: 'Desde $50/hora',
    description: 'Especialista en instalaciones y reparaciones. 15 años de experiencia.',
  },
  {
    id: '2',
    name: 'María García',
    category: 'Electricista',
    rating: 4.9,
    reviewCount: 203,
    distance: 2.5,
    isVerified: true,
    price: 'Desde $60/hora',
    description: 'Certificada en instalaciones eléctricas residenciales.',
  },
];

export default function HomeScreen({ navigation }: any) {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = [
    { id: '1', name: t('home.categoryNames.plumbing'), icon: '🔧', count: 45 },
    { id: '2', name: t('home.categoryNames.electricity'), icon: '💡', count: 38 },
    { id: '3', name: t('home.categoryNames.carpentry'), icon: '🪚', count: 52 },
    { id: '4', name: t('home.categoryNames.cleaning'), icon: '🧹', count: 67 },
    { id: '5', name: t('home.categoryNames.painting'), icon: '🎨', count: 41 },
  ];

  return (
    <Screen safe className="bg-gray-50">
      <Container>
        <Text variant="h2" weight="bold" className="mb-2">
          {t('home.greeting')}
        </Text>
        <Text variant="body" color="muted" className="mb-6">
          {t('home.question')}
        </Text>

        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder={t('home.searchPlaceholder')}
          showFilter
          onFilterPress={() => {}}
        />

        <Spacer size="lg" />

        <Text variant="h4" weight="bold" className="mb-4">
          {t('home.categories')}
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-6"
        >
          {categories.map((category) => (
            <CategoryCard
              key={category.id}
              {...category}
              isActive={selectedCategory === category.id}
              onPress={() => setSelectedCategory(category.id)}
            />
          ))}
        </ScrollView>

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
      </Container>

      <ScrollView className="flex-1 px-4">
        {nearbyProfessionals.map((professional) => (
          <ProfessionalCard
            key={professional.id}
            {...professional}
            onPress={() =>
              navigation.navigate('ProfessionalDetail', { id: professional.id })
            }
            onFavorite={() => {}}
          />
        ))}
      </ScrollView>
    </Screen>
  );
}

