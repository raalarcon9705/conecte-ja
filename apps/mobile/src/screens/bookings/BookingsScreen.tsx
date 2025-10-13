/** @jsxImportSource nativewind */
import React, { useState, useEffect } from 'react';
import { ScrollView, View, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Calendar } from 'lucide-react-native';
import {
  Screen,
  Text,
  BookingCard,
  Container,
  Spacer,
  Empty,
  Tabs,
} from '@conecteja/ui-mobile';
import { useBookings } from '../../contexts/BookingsContext';
import { useAuth } from '../../contexts/AuthContext';
import { formatCurrency } from '@conecteja/utils';

export default function BookingsScreen({ navigation }: any) {
  const { t } = useTranslation();
  const { user, currentMode } = useAuth();
  const { bookings, loading, fetchBookings } = useBookings();
  const [activeTab, setActiveTab] = useState('upcoming');

  useEffect(() => {
    if (user?.id) {
      fetchBookings(user.id, currentMode);
    }
  }, [user, currentMode]);

  const tabs = [
    { id: 'upcoming', label: t('bookings.tabs.upcoming') },
    { id: 'completed', label: t('bookings.tabs.completed') },
    { id: 'cancelled', label: t('bookings.tabs.cancelled') },
  ];

  const filteredBookings = bookings.filter((booking) => {
    if (activeTab === 'upcoming')
      return booking.status === 'confirmed' || booking.status === 'pending';
    if (activeTab === 'completed') return booking.status === 'completed';
    if (activeTab === 'cancelled') return booking.status === 'canceled';
    return false;
  });

  if (loading && bookings.length === 0) {
    return (
      <Screen safe className="bg-gray-50">
        <Container className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3B82F6" />
        </Container>
      </Screen>
    );
  }

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
            icon={<Calendar size={64} color="#9CA3AF" />}
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
          filteredBookings.map((booking) => {
            // Determine the name based on current mode
            const otherPartyName = currentMode === 'client'
              ? booking.professional_profile?.profiles?.full_name || 'Profesional'
              : booking.client_profile?.full_name || 'Cliente';

            // Format date and time
            const bookingDate = new Date(booking.booking_date);
            const formattedDate = bookingDate.toLocaleDateString('es', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            });

            return (
              <BookingCard
                key={booking.id}
                id={booking.id}
                professionalName={otherPartyName}
                serviceName={booking.service_name}
                date={formattedDate}
                time={booking.start_time}
                status={booking.status as 'pending' | 'confirmed' | 'completed'}
                price={booking.price ? formatCurrency(booking.price) : ''}
                onPress={() =>
                  navigation.navigate('BookingDetail', { id: booking.id })
                }
                onCancel={() => {
                  // TODO: Handle cancel - navigate to cancel screen
                }}
                onReschedule={() => {
                  // TODO: Handle reschedule - navigate to reschedule screen
                }}
              />
            );
          })
        )}
      </ScrollView>
    </Screen>
  );
}

