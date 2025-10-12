/** @jsxImportSource nativewind */
import React, { useState } from 'react';
import { View, TouchableOpacity, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import {
  Screen,
  Text,
  Avatar,
  Button,
  Container,
  Spacer,
  Rating,
  Badge,
  VerificationBadge,
  LocationTag,
  Divider,
  Tabs,
  ServiceCard,
  ReviewCard,
  ImageGallery,
} from '@conecteja/ui-mobile';

const services = [
  {
    id: '1',
    name: 'Reparación básica',
    description: 'Reparación de fugas y grifos',
    price: '$50',
    duration: '1 hora',
  },
  {
    id: '2',
    name: 'Instalación completa',
    description: 'Instalación de sanitarios y cañerías',
    price: '$150',
    duration: '3-4 horas',
  },
];

const reviews = [
  {
    id: '1',
    userName: 'Ana Martínez',
    rating: 5,
    comment: 'Excelente servicio, muy profesional y puntual. Totalmente recomendado!',
    date: 'Hace 1 semana',
    response: {
      text: 'Muchas gracias por tu comentario Ana! Fue un placer trabajar contigo.',
      date: 'Hace 6 días',
    },
  },
  {
    id: '2',
    userName: 'Pedro González',
    rating: 4,
    comment: 'Buen trabajo, llegó a tiempo y resolvió el problema rápidamente.',
    date: 'Hace 2 semanas',
  },
];

const galleryImages = [
  { id: '1', uri: 'https://via.placeholder.com/400' },
  { id: '2', uri: 'https://via.placeholder.com/400' },
  { id: '3', uri: 'https://via.placeholder.com/400' },
];

export default function ProfessionalDetailScreen({ navigation, route }: any) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('services');
  const [selectedService, setSelectedService] = useState<string | null>(null);

  const tabs = [
    { id: 'services', label: t('professional.tabs.services') },
    { id: 'reviews', label: t('professional.tabs.reviews'), badge: 156 },
    { id: 'about', label: t('professional.tabs.about') },
  ];

  const professional = {
    name: 'Juan Pérez',
    category: 'Plomero',
    rating: 4.8,
    reviewCount: 156,
    distance: 1.2,
    isPremium: true,
    isVerified: true,
    yearsExperience: 15,
    completedJobs: 450,
    responseTime: '30 min',
    location: 'Buenos Aires, Argentina',
    bio: 'Plomero profesional con 15 años de experiencia en instalaciones y reparaciones residenciales y comerciales. Certificado en sistemas de cañerías y sanitarios.',
  };

  return (
    <Screen className="bg-white">
      <ScrollView>
        <View className="px-4 pt-4">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text className="text-2xl">←</Text>
          </TouchableOpacity>
        </View>

        <Container>
          <View className="items-center py-6">
            <Avatar name={professional.name} size="xl" />
            <Spacer size="md" />

            <View className="flex-row items-center">
              <Text variant="h3" weight="bold" className="mr-2">
                {professional.name}
              </Text>
              <VerificationBadge isVerified={professional.isVerified} />
            </View>

            <Text variant="body" color="muted" className="mb-2">
              {professional.category}
            </Text>

            {professional.isPremium && (
              <Badge variant="warning" className="mb-3">
                {t('professional.premium')}
              </Badge>
            )}

            <View className="flex-row items-center mb-3">
              <Rating value={professional.rating} readonly size="md" showValue />
              <Text variant="caption" color="muted" className="ml-2">
                ({t('professional.reviews', { count: professional.reviewCount })})
              </Text>
            </View>

            <LocationTag location={professional.location} distance={professional.distance} />
          </View>

          <View className="flex-row gap-2 mb-6">
            <View className="flex-1 bg-gray-50 rounded-xl p-4 items-center">
              <Text variant="h4" weight="bold" className="mb-1">
                {professional.yearsExperience}
              </Text>
              <Text variant="caption" color="muted" align="center">
                {t('professional.stats.experience')}
              </Text>
            </View>
            <View className="flex-1 bg-gray-50 rounded-xl p-4 items-center">
              <Text variant="h4" weight="bold" className="mb-1">
                {professional.completedJobs}
              </Text>
              <Text variant="caption" color="muted" align="center">
                {t('professional.stats.completed')}
              </Text>
            </View>
            <View className="flex-1 bg-gray-50 rounded-xl p-4 items-center">
              <Text variant="h4" weight="bold" className="mb-1">
                {professional.responseTime}
              </Text>
              <Text variant="caption" color="muted" align="center">
                {t('professional.stats.responseTime')}
              </Text>
            </View>
          </View>

          <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

          {activeTab === 'services' && (
            <View>
              {services.map((service) => (
                <ServiceCard
                  key={service.id}
                  {...service}
                  isSelected={selectedService === service.id}
                  onPress={() => setSelectedService(service.id)}
                />
              ))}
            </View>
          )}

          {activeTab === 'reviews' && (
            <View>
              {reviews.map((review) => (
                <ReviewCard key={review.id} {...review} />
              ))}
            </View>
          )}

          {activeTab === 'about' && (
            <View>
              <Text variant="body" weight="medium" className="mb-3">
                {t('professional.aboutMe')}
              </Text>
              <Text variant="body" color="secondary" className="mb-6">
                {professional.bio}
              </Text>

              <Text variant="body" weight="medium" className="mb-3">
                {t('professional.gallery')}
              </Text>
              <ImageGallery images={galleryImages} />
            </View>
          )}
        </Container>
      </ScrollView>

      <View className="bg-white border-t border-gray-200 px-4 py-3">
        <View className="flex-row gap-2">
          <Button
            variant="outline"
            onPress={() => navigation.navigate('ChatDetail', { id: '1' })}
            className="flex-1"
          >
            {t('professional.buttons.chat')}
          </Button>
          <Button
            variant="primary"
            onPress={() => {
              // TODO: Navigate to booking screen
            }}
            className="flex-1"
          >
            {t('professional.buttons.book')}
          </Button>
        </View>
      </View>
    </Screen>
  );
}

