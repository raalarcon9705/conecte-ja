/** @jsxImportSource nativewind */
import React from 'react';
import { View, TouchableOpacity, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import {
  Screen,
  Text,
  Avatar,
  Card,
  Button,
  Container,
  Spacer,
  Divider,
  Badge,
  LocationTag,
  PriceTag,
} from '@conecteja/ui-mobile';

export default function BookingDetailScreen({ navigation, route }: any) {
  const { t } = useTranslation();
  const booking = {
    id: '1',
    professionalName: 'Juan Pérez',
    serviceName: 'Reparación de tubería',
    date: '15 Oct 2025',
    time: '10:00 AM',
    status: 'confirmed',
    price: '$150',
    address: 'Av. Libertador 1234, Buenos Aires',
    notes: 'Tubería con pérdida en el baño principal',
  };

  return (
    <Screen safe scrollable className="bg-gray-50">
      <Container>
        <View className="flex-row items-center mb-6">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text className="text-2xl">←</Text>
          </TouchableOpacity>
          <Text variant="h3" weight="bold" className="flex-1 ml-4">
            {t('bookings.detail.title')}
          </Text>
        </View>

        <Card variant="elevated" className="mb-4">
          <Badge
            variant={
              booking.status === 'confirmed'
                ? 'success'
                : booking.status === 'pending'
                ? 'warning'
                : 'info'
            }
            className="self-start mb-4"
          >
            {booking.status === 'confirmed'
              ? t('bookings.detail.status.confirmed')
              : booking.status === 'pending'
              ? t('bookings.detail.status.pending')
              : t('bookings.detail.status.completed')}
          </Badge>

          <View className="flex-row items-center mb-4">
            <Avatar name={booking.professionalName} size="md" />
            <View className="flex-1 ml-3">
              <Text variant="body" weight="bold">
                {booking.professionalName}
              </Text>
              <Text variant="caption" color="muted">
                {t('bookings.detail.role')}
              </Text>
            </View>
          </View>

          <Divider />

          <View className="py-4">
            <Text variant="h4" weight="bold" className="mb-3">
              {booking.serviceName}
            </Text>

            <View className="flex-row items-center mb-2">
              <Text className="text-xl mr-2">📅</Text>
              <Text variant="body" color="secondary">
                {booking.date} • {booking.time}
              </Text>
            </View>

            <LocationTag location={booking.address} className="mb-2" />

            <View className="flex-row items-center">
              <Text className="text-xl mr-2">💰</Text>
              <PriceTag amount={booking.price} />
            </View>
          </View>

          {booking.notes && (
            <>
              <Divider />
              <View className="pt-4">
                <Text variant="body" weight="medium" className="mb-2">
                  {t('bookings.detail.notes')}
                </Text>
                <Text variant="body" color="secondary">
                  {booking.notes}
                </Text>
              </View>
            </>
          )}
        </Card>

        {booking.status === 'confirmed' && (
          <>
            <Button
              variant="primary"
              fullWidth
              className="mb-3"
              onPress={() => {
                navigation.navigate('ChatDetail', {
                  id: '1',
                  name: booking.professionalName,
                });
              }}
            >
              {t('bookings.detail.buttons.contact')}
            </Button>

            <Button variant="outline" fullWidth className="mb-3">
              {t('bookings.detail.buttons.reschedule')}
            </Button>

            <Button variant="ghost" fullWidth>
              {t('bookings.detail.buttons.cancel')}
            </Button>
          </>
        )}

        {booking.status === 'completed' && (
          <Button variant="primary" fullWidth>
            {t('bookings.detail.buttons.review')}
          </Button>
        )}
      </Container>
    </Screen>
  );
}

