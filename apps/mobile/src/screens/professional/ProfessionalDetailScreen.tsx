/** @jsxImportSource nativewind */
import React from 'react';
import { View, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react-native';
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
  Tabs,
  ServiceCard,
  ReviewCard,
  ImageGallery,
} from '@conecteja/ui-mobile';
import { formatCurrency } from '@conecteja/utils';
import { useAuth } from '../../contexts/AuthContext';
import { useProfessionalDetails } from '../../hooks';
import { ProfessionalDetailScreenProps } from '../../types/navigation';

export default function ProfessionalDetailScreen({ navigation, route }: ProfessionalDetailScreenProps) {
  const { t } = useTranslation();
  const { id } = route.params;
  const { user, currentMode } = useAuth();

  // Redirect professionals to home - professional details are only for clients
  React.useEffect(() => {
    if (currentMode === 'professional') {
      navigation.replace('Home');
    }
  }, [currentMode, navigation]);

  // Custom hook that handles all the data fetching logic
  const {
    professional,
    reviews,
    galleryImages,
    services,
    loading,
    loadingReviews,
    loadingGallery,
    activeTab,
    setActiveTab,
    selectedService,
    setSelectedService,
  } = useProfessionalDetails(id);

  // Loading state
  if (loading || !professional) {
    return (
      <Screen className="bg-white">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      </Screen>
    );
  }

  // Tabs configuration
  const tabs = [
    { id: 'services', label: t('professional.tabs.services') },
    { id: 'reviews', label: t('professional.tabs.reviews'), badge: professional.total_reviews || 0 },
    { id: 'about', label: t('professional.tabs.about') },
  ];

  const handleStartChat = () => {
    if (!user?.id || !professional?.profile_id) return;

    // Navigate directly to chat without creating conversation
    // Conversation will be created when first message is sent
    navigation.navigate('ChatDetail', { 
      clientId: user.id,
      professionalId: professional.profile_id,
      professionalName: professional.profiles?.full_name,
      professionalAvatar: professional.profiles?.avatar_url || undefined,
    });
  };

  return (
    <Screen className="bg-white">
      <ScrollView>
        <View className="px-4 pt-4">
          <TouchableOpacity onPress={() => navigation.goBack()} className="p-2">
            <ArrowLeft size={24} color="#000000" />
          </TouchableOpacity>
        </View>

        <Container>
          <View className="items-center py-6">
            <Avatar 
              source={professional.profiles?.avatar_url ? { uri: professional.profiles.avatar_url } : undefined}
              name={professional.profiles?.full_name || t('professional.defaults.name')} 
              size="xl" 
            />
            <Spacer size="md" />

            <View className="flex-row items-center">
              <Text variant="h3" weight="bold" className="mr-2">
                {professional.profiles?.full_name || t('professional.defaults.name')}
              </Text>
              <VerificationBadge isVerified={professional.is_verified || false} />
            </View>

            <Text variant="body" color="muted" className="mb-2">
              {professional.categories?.name || t('professional.defaults.category')}
            </Text>

            {professional.subscription_plan?.slug === 'premium' && (
              <Badge variant="warning" className="mb-3">
                {t('professional.premium')}
              </Badge>
            )}

            <View className="flex-row items-center mb-3">
              <Rating value={Number(professional.average_rating) || 0} readonly size="md" showValue />
              <Text variant="caption" color="muted" className="ml-2">
                ({t('professional.reviews', { count: professional.total_reviews || 0 })})
              </Text>
            </View>

            <LocationTag 
              location={`${professional.profiles?.city || ''}, ${professional.profiles?.state || ''}`}
              distance={0} 
            />
          </View>

          <View className="flex-row gap-2 mb-6">
            <View className="flex-1 bg-gray-50 rounded-xl p-4 items-center">
              <Text variant="h4" weight="bold" className="mb-1">
                {professional.years_experience || 0}
              </Text>
              <Text variant="caption" color="muted" align="center">
                {t('professional.stats.experience')}
              </Text>
            </View>
            <View className="flex-1 bg-gray-50 rounded-xl p-4 items-center">
              <Text variant="h4" weight="bold" className="mb-1">
                {professional.completed_bookings || 0}
              </Text>
              <Text variant="caption" color="muted" align="center">
                {t('professional.stats.completed')}
              </Text>
            </View>
            <View className="flex-1 bg-gray-50 rounded-xl p-4 items-center">
              <Text variant="h4" weight="bold" className="mb-1">
                30 min
              </Text>
              <Text variant="caption" color="muted" align="center">
                {t('professional.stats.responseTime')}
              </Text>
            </View>
          </View>

          <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

          {activeTab === 'services' && (
            <View>
              {services.length > 0 ? (
                services.map((service: unknown, index: number) => {
              const svc = service as { name?: string; description?: string; price?: number; duration_minutes?: number };
              return (
                <ServiceCard
                  key={index}
                  id={String(index)}
                  name={svc.name || t('professional.defaults.service')}
                  description={svc.description || ''}
                  price={svc.price ? formatCurrency(svc.price) : ''}
                  duration={svc.duration_minutes ? `${svc.duration_minutes} min` : ''}
                  isSelected={selectedService === String(index)}
                  onPress={() => setSelectedService(String(index))}
                />
              );
            })
              ) : (
                <Text variant="body" color="muted" className="text-center py-8">
                  {t('professional.empty.services')}
                </Text>
              )}
            </View>
          )}

          {activeTab === 'reviews' && (
            <View>
              {loadingReviews ? (
                <View className="py-8 items-center">
                  <ActivityIndicator size="large" color="#3b82f6" />
                </View>
              ) : reviews.length > 0 ? (
                reviews.map((review) => (
                  <ReviewCard 
                    key={review.id}
                    id={review.id}
                    userName={review.client_profile?.full_name || 'Usuario'}
                    userAvatar={review.client_profile?.avatar_url || undefined}
                    rating={review.rating}
                    comment={review.comment || ''}
                    date={review.created_at ? new Date(review.created_at).toLocaleDateString() : ''}
                    response={review.response && review.response_at ? {
                      text: review.response,
                      date: new Date(review.response_at as string).toLocaleDateString()
                    } : undefined}
                  />
                ))
              ) : (
                <Text variant="body" color="muted" className="text-center py-8">
                  {t('professional.empty.reviews')}
                </Text>
              )}
            </View>
          )}

          {activeTab === 'about' && (
            <View>
              <Text variant="body" weight="medium" className="mb-3">
                {t('professional.aboutMe')}
              </Text>
              <Text variant="body" color="secondary" className="mb-6">
                {professional.description || professional.profiles?.bio || t('professional.empty.description')}
              </Text>

              {loadingGallery ? (
                <View className="py-8 items-center">
                  <ActivityIndicator size="large" color="#3b82f6" />
                </View>
              ) : galleryImages.length > 0 ? (
                <>
                  <Text variant="body" weight="medium" className="mb-3">
                    {t('professional.gallery')}
                  </Text>
                  <ImageGallery images={galleryImages.map((item: unknown) => {
                    const img = item as { id: string; image_url: string; title?: string; description?: string };
                    return {
                      id: img.id,
                      uri: img.image_url,
                      title: img.title,
                      description: img.description,
                    };
                  })} />
                </>
              ) : null}
            </View>
          )}
        </Container>
      </ScrollView>

      <View className="bg-white border-t border-gray-200 px-4 py-3">
        <View className="flex-row gap-2">
            <Button
            variant="outline"
            onPress={handleStartChat}
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

