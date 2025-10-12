/** @jsxImportSource nativewind */
import React, { useState } from 'react';
import { View, ScrollView, Dimensions } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Screen, Text, Button, Spacer } from '@conecteja/ui-mobile';

const { width } = Dimensions.get('window');

export default function OnboardingScreen({ navigation }: any) {
  const { t } = useTranslation();
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      icon: '🔍',
      title: t('auth.onboarding.slide1.title'),
      description: t('auth.onboarding.slide1.description'),
    },
    {
      icon: '⭐',
      title: t('auth.onboarding.slide2.title'),
      description: t('auth.onboarding.slide2.description'),
    },
    {
      icon: '💬',
      title: t('auth.onboarding.slide3.title'),
      description: t('auth.onboarding.slide3.description'),
    },
    {
      icon: '📅',
      title: t('auth.onboarding.slide4.title'),
      description: t('auth.onboarding.slide4.description'),
    },
  ];

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      navigation.navigate('Login');
    }
  };

  const handleSkip = () => {
    navigation.navigate('Login');
  };

  return (
    <Screen safe className="bg-white">
      <View className="flex-1 items-center justify-between py-12 px-6">
        <Button variant="ghost" onPress={handleSkip} className="self-end">
          {t('auth.onboarding.skip')}
        </Button>

        <View className="flex-1 items-center justify-center">
          <Text className="text-8xl mb-8">{slides[currentSlide].icon}</Text>

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

          <Button variant="primary" onPress={handleNext} fullWidth>
            {currentSlide === slides.length - 1 ? t('auth.onboarding.start') : t('auth.onboarding.next')}
          </Button>
        </View>
      </View>
    </Screen>
  );
}

