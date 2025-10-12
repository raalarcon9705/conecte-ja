/** @jsxImportSource nativewind */
import React, { useState } from 'react';
import { View, TouchableOpacity, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import {
  Screen,
  Text,
  SubscriptionCard,
  Container,
  Spacer,
  Alert,
} from '@conecteja/ui-mobile';

export default function SubscriptionScreen({ navigation }: any) {
  const { t } = useTranslation();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const plans = [
    {
      id: 'free',
      name: t('subscription.plans.free.name'),
      price: '$0',
      period: 'mes',
      features: t('subscription.plans.free.features', { returnObjects: true }) as string[],
      isCurrent: true,
    },
    {
      id: 'starter',
      name: t('subscription.plans.starter.name'),
      price: '$9.99',
      period: 'mes',
      features: t('subscription.plans.starter.features', { returnObjects: true }) as string[],
    },
    {
      id: 'premium',
      name: t('subscription.plans.premium.name'),
      price: '$19.99',
      period: 'mes',
      features: t('subscription.plans.premium.features', { returnObjects: true }) as string[],
      isPopular: true,
    },
  ];

  const handleSubscribe = async (planId: string) => {
    setLoading(true);
    // TODO: Implement subscription logic
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  };

  return (
    <Screen safe scrollable className="bg-gray-50">
      <Container>
        <View className="flex-row items-center mb-6">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text className="text-2xl">←</Text>
          </TouchableOpacity>
          <Text variant="h3" weight="bold" className="flex-1 ml-4">
            {t('subscription.title')}
          </Text>
        </View>

        <Alert variant="info" className="mb-6">
          {t('subscription.alert')}
        </Alert>

        <Text variant="h4" weight="bold" className="mb-4">
          {t('subscription.subtitle')}
        </Text>
        <Text variant="body" color="muted" className="mb-6">
          {t('subscription.description')}
        </Text>

        {plans.map((plan) => (
          <SubscriptionCard
            key={plan.id}
            {...plan}
            onPress={() => handleSubscribe(plan.id)}
          />
        ))}

        <Spacer size="lg" />

        <View className="bg-blue-50 rounded-xl p-4 mb-6">
          <Text variant="body" weight="bold" className="mb-2">
            {t('subscription.whyUpgrade.title')}
          </Text>
          <Text variant="caption" color="secondary">
            {(t('subscription.whyUpgrade.features', { returnObjects: true }) as string[]).join('\n')}
          </Text>
        </View>

        <Text variant="caption" color="muted" align="center">
          {t('subscription.footer')}
        </Text>
      </Container>
    </Screen>
  );
}

