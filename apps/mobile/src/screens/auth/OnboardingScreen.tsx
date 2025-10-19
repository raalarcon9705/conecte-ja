/** @jsxImportSource nativewind */
import React, { useState } from 'react';
import { View, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Search, Star, MessageCircle, Calendar } from 'lucide-react-native';
import { Screen, Text, Button } from '@conecteja/ui-mobile';
import { setOnboardingCompleted } from '@conecteja/supabase';
import { OnboardingScreenProps } from '../../types/navigation';

export default function OnboardingScreen({ navigation }: OnboardingScreenProps) {
  const { t } = useTranslation();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isCompleting, setIsCompleting] = useState(false);

  const slides = [
    {
      icon: <Search size={64} color="#3B82F6" />,
      title: t('auth.onboarding.slide1.title'),
      description: t('auth.onboarding.slide1.description'),
    },
    {
      icon: <Star size={64} color="#F59E0B" />,
      title: t('auth.onboarding.slide2.title'),
      description: t('auth.onboarding.slide2.description'),
    },
    {
      icon: <MessageCircle size={64} color="#10B981" />,
      title: t('auth.onboarding.slide3.title'),
      description: t('auth.onboarding.slide3.description'),
    },
    {
      icon: <Calendar size={64} color="#8B5CF6" />,
      title: t('auth.onboarding.slide4.title'),
      description: t('auth.onboarding.slide4.description'),
    },
  ];

  const completeOnboarding = async () => {
    try {
      setIsCompleting(true);
      await setOnboardingCompleted();
      navigation.navigate('Login');
    } catch (error) {
      console.error('Error completing onboarding:', error);
      Alert.alert(
        'Error',
        'Failed to save onboarding progress. Please try again.',
        [
          {
            text: 'Retry',
            onPress: completeOnboarding,
          },
          {
            text: 'Continue anyway',
            onPress: () => navigation.navigate('Login'),
          },
        ]
      );
    } finally {
      setIsCompleting(false);
    }
  };

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      completeOnboarding();
    }
  };

  const handleSkip = () => {
    completeOnboarding();
  };

  return (
    <Screen safe className="bg-white">
      <View className="flex-1 items-center justify-between py-12 px-6">
        <Button 
          variant="ghost" 
          onPress={handleSkip} 
          className="self-end"
          disabled={isCompleting}
        >
          {t('auth.onboarding.skip')}
        </Button>

        <View className="flex-1 items-center justify-center">
          <View className="mb-8">{slides[currentSlide].icon}</View>

          <Text variant="h2" weight="bold" align="center" className="mb-4">
            {slides[currentSlide].title}
          </Text>

          <Text variant="body" color="muted" align="center" className="px-8">
            {slides[currentSlide].description}
          </Text>
        </View>

        <View className="w-full">
          <View className="flex-row justify-center mb-8">
            {slides.map((_, index) => (
              <View
                key={index}
                className={`h-2 rounded-full mx-1 ${
                  index === currentSlide
                    ? 'w-8 bg-blue-600'
                    : 'w-2 bg-gray-300'
                }`}
              />
            ))}
          </View>

          <Button 
            variant="primary" 
            onPress={handleNext} 
            fullWidth
            disabled={isCompleting}
          >
            {isCompleting 
              ? t('common.loading')
              : currentSlide === slides.length - 1 
                ? t('auth.onboarding.start') 
                : t('auth.onboarding.next')
            }
          </Button>
        </View>
      </View>
    </Screen>
  );
}

