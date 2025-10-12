/** @jsxImportSource nativewind */
import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import {
  Screen,
  Text,
  BookingCard,
  Container,
  Spacer,
  Empty,
  Tabs,
} from '@conecteja/ui-mobile';

const bookings = [
  {
    id: '1',
    professionalName: 'Juan Pérez',
    serviceName: 'Reparación de tubería',
    date: '15 Oct 2025',
    time: '10:00 AM',
    status: 'confirmed' as const,
    price: '$150',
  },
  {
    id: '2',
    professionalName: 'María García',
    serviceName: 'Instalación eléctrica',
    date: '20 Oct 2025',
    time: '2:00 PM',
    status: 'pending' as const,
    price: '$200',
  },
  {
    id: '3',
    professionalName: 'Carlos López',
    serviceName: 'Pintura interior',
    date: '10 Oct 2025',
    time: '9:00 AM',
    status: 'completed' as const,
    price: '$500',
  },
];

export default function BookingsScreen({ navigation }: any) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('upcoming');

  const tabs = [
    { id: 'upcoming', label: t('bookings.tabs.upcoming') },
    { id: 'completed', label: t('bookings.tabs.completed') },
    { id: 'cancelled', label: t('bookings.tabs.cancelled') },
  ];

  const filteredBookings = bookings.filter((booking) => {
    if (activeTab === 'upcoming')
      return booking.status === 'confirmed' || booking.status === 'pending';
    if (activeTab === 'completed') return booking.status === 'completed';
    if (activeTab === 'cancelled') return booking.status === 'cancelled';
    return true;
  });

  return (
    <Screen safe className="bg-gray-50">
      <Container>
        <Text variant="h2" weight="bold" className="mb-6">
          {t('bookings.title')}
        </Text>

        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          variant="default"
        />
      </Container>

      <ScrollView className="flex-1 px-4">
        {filteredBookings.length === 0 ? (
          <Empty
            icon={<Text className="text-6xl">📅</Text>}
            title={t('bookings.empty.title')}
            description={
              activeTab === 'upcoming'
                ? t('bookings.empty.descriptionUpcoming')
                : t('bookings.empty.descriptionOther')
            }
            action={
              activeTab === 'upcoming'
                ? {
                    label: t('bookings.empty.action'),
                    onPress: () => navigation.navigate('Search'),
                  }
                : undefined
            }
          />
        ) : (
          filteredBookings.map((booking) => (
            <BookingCard
              key={booking.id}
              {...booking}
              onPress={() =>
                navigation.navigate('BookingDetail', { id: booking.id })
              }
              onCancel={() => {
                // TODO: Handle cancel
              }}
              onReschedule={() => {
                // TODO: Handle reschedule
              }}
            />
          ))
        )}
      </ScrollView>
    </Screen>
  );
}

