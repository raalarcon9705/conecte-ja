/** @jsxImportSource nativewind */
import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, ScrollView, ActivityIndicator, Alert as RNAlert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react-native';
import {
  Screen,
  Text,
  SubscriptionCard,
  Container,
  Spacer,
  Alert,
} from '@conecteja/ui-mobile';
import { useAuth } from '../../contexts/AuthContext';
import { useSubscriptions } from '../../contexts/SubscriptionsContext';

export default function SubscriptionScreen({ navigation }: any) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { 
    currentSubscription, 
    availablePlans, 
    loading: subscriptionsLoading,
    fetchCurrentSubscription,
    createSubscription,
  } = useSubscriptions();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchCurrentSubscription(user.id);
    }
  }, [user]);

  if (subscriptionsLoading && availablePlans.length === 0) {
    return (
      <Screen safe className="bg-gray-50">
        <Container className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3B82F6" />
        </Container>
      </Screen>
    );
  }

  const plans = availablePlans.map((plan) => {
    const features = plan.features as any;
    const isCurrent = currentSubscription?.plan_id === plan.id;

    return {
      id: plan.id,
      name: plan.name,
      price: `$${plan.price_monthly}`,
      period: 'mes',
      features: [
        features.chat_enabled ? '✓ Chat habilitado' : '✗ Chat habilitado',
        features.send_images ? '✓ Envío de imágenes' : '✗ Envío de imágenes',
        features.send_location ? '✓ Envío de ubicación' : '✗ Envío de ubicación',
        features.whatsapp_button ? '✓ Botón de WhatsApp' : '✗ Botón de WhatsApp',
        `${features.weekly_contacts || 0} contactos por semana`,
        features.featured_listing ? '✓ Destacado en listado' : '',
        features.analytics ? '✓ Analíticas avanzadas' : '',
        features.priority_support ? '✓ Soporte prioritario' : '',
        features.badge ? `✓ Badge: ${features.badge}` : '',
      ].filter(Boolean),
      isCurrent,
      isPopular: plan.slug === 'premium',
    };
  });

  const handleSubscribe = async (planId: string) => {
    try {
      setLoading(true);
      
      RNAlert.alert(
        'Confirmar Suscripción',
        '¿Deseas suscribirte a este plan?',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Confirmar',
            onPress: async () => {
              try {
                await createSubscription(planId);
                RNAlert.alert('Éxito', 'Suscripción creada exitosamente');
                navigation.goBack();
              } catch (error: any) {
                RNAlert.alert('Error', error.message || 'No se pudo crear la suscripción');
              }
            },
          },
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen safe scrollable className="bg-gray-50">
      <Container>
        <View className="flex-row items-center mb-6">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ArrowLeft size={24} color="#374151" />
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

