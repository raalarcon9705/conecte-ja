/** @jsxImportSource nativewind */
import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, CalendarDays, DollarSign } from 'lucide-react-native';
import {
  Screen,
  Text,
  Avatar,
  Card,
  Button,
  Container,
  Divider,
  Badge,
  LocationTag,
  PriceTag,
} from '@conecteja/ui-mobile';
import { useBookings } from '../../contexts/BookingsContext';
import { useAuth } from '../../contexts/AuthContext';
import { formatCurrency } from '@conecteja/utils';
import { BookingDetailScreenProps } from '../../types/navigation';

export default function BookingDetailScreen({ navigation, route }: BookingDetailScreenProps) {
  const { t } = useTranslation();
  const { id } = route.params || {};
  const { currentMode } = useAuth();
  const { currentBooking, loading, fetchBookingById, cancelBooking, confirmBooking, completeBooking } = useBookings();
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (id) {
      fetchBookingById(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading || !currentBooking) {
    return (
      <Screen safe className="bg-gray-50">
        <Container className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3B82F6" />
        </Container>
      </Screen>
    );
  }

  const booking = currentBooking;
  
  // Determine the other party based on current mode
  const otherProfile = currentMode === 'client'
    ? booking.professional_profile
    : { profiles: booking.client_profile };
  
  const otherPartyName = currentMode === 'client'
    ? booking.professional_profile?.profiles?.full_name || t('common.professional')
    : booking.client_profile?.full_name || t('common.client');

  // Format date
  const bookingDate = new Date(booking.booking_date);
  const formattedDate = bookingDate.toLocaleDateString('es', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const handleCancel = () => {
    Alert.alert(
      t('bookings.detail.buttons.cancel'),
      '¿Estás seguro que deseas cancelar esta reserva?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Sí, cancelar',
          style: 'destructive',
          onPress: async () => {
            try {
              setActionLoading(true);
              await cancelBooking(booking.id, 'Cancelado por usuario');
              Alert.alert(t('common.success'), t('bookings.detail.success.cancelled'));
              navigation.goBack();
            } catch {
              Alert.alert(t('common.error'), t('bookings.detail.errors.cancelFailed'));
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleConfirm = async () => {
    try {
      setActionLoading(true);
      await confirmBooking(booking.id);
      Alert.alert(t('common.success'), t('bookings.detail.success.confirmed'));
    } catch {
      Alert.alert(t('common.error'), t('bookings.detail.errors.confirmFailed'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleComplete = async () => {
    try {
      setActionLoading(true);
      await completeBooking(booking.id);
      Alert.alert(t('common.success'), t('bookings.detail.success.completed'));
    } catch {
      Alert.alert(t('common.error'), t('bookings.detail.errors.completeFailed'));
    } finally {
      setActionLoading(false);
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
                : booking.status === 'completed'
                ? 'info'
                : 'danger'
            }
            className="self-start mb-4"
          >
            {booking.status === 'confirmed'
              ? t('bookings.detail.status.confirmed')
              : booking.status === 'pending'
              ? t('bookings.detail.status.pending')
              : booking.status === 'completed'
              ? t('bookings.detail.status.completed')
              : 'Cancelado'}
          </Badge>

          <View className="flex-row items-center mb-4">
            <Avatar 
              name={otherPartyName} 
              size="md"
              uri={otherProfile?.profiles?.avatar_url}
            />
            <View className="flex-1 ml-3">
              <Text variant="body" weight="bold">
                {otherPartyName}
              </Text>
              <Text variant="caption" color="muted">
                {currentMode === 'client' ? t('bookings.detail.role') : 'Cliente'}
              </Text>
            </View>
          </View>

          <Divider />

          <View className="py-4">
            <Text variant="h4" weight="bold" className="mb-3">
              {booking.service_name}
            </Text>

            {booking.service_description && (
              <Text variant="body" color="secondary" className="mb-3">
                {booking.service_description}
              </Text>
            )}

            <View className="flex-row items-center mb-2">
              <CalendarDays size={20} color="#6B7280" className="mr-2" />
              <Text variant="body" color="secondary">
                {formattedDate} • {booking.start_time}
              </Text>
            </View>

            {booking.location_address && (
              <LocationTag location={booking.location_address} className="mb-2" />
            )}

            {booking.price && (
              <View className="flex-row items-center">
                <DollarSign size={20} color="#6B7280" className="mr-2" />
                <PriceTag amount={formatCurrency(booking.price)} />
              </View>
            )}
          </View>

          {(booking.client_notes || booking.professional_notes) && (
            <>
              <Divider />
              <View className="pt-4">
                <Text variant="body" weight="medium" className="mb-2">
                  {t('bookings.detail.notes')}
                </Text>
                <Text variant="body" color="secondary">
                  {currentMode === 'client' ? booking.client_notes : booking.professional_notes}
                </Text>
              </View>
            </>
          )}
        </Card>

        {/* Actions for pending bookings (professional can confirm) */}
        {booking.status === 'pending' && currentMode === 'professional' && (
          <>
            <Button
              variant="primary"
              fullWidth
              className="mb-3"
              onPress={handleConfirm}
              loading={actionLoading}
              disabled={actionLoading}
            >
              Confirmar Reserva
            </Button>

            <Button 
              variant="ghost" 
              fullWidth
              onPress={handleCancel}
              disabled={actionLoading}
            >
              {t('bookings.detail.buttons.cancel')}
            </Button>
          </>
        )}

        {/* Actions for confirmed bookings */}
        {booking.status === 'confirmed' && (
          <>
            <Button
              variant="primary"
              fullWidth
              className="mb-3"
              onPress={() => {
                navigation.navigate('ChatDetail', {
                  conversationId: undefined,
                  clientId: booking.client_profile_id,
                  professionalId: booking.professional_profile_id,
                  professionalName: otherPartyName,
                  professionalAvatar: otherProfile?.profiles?.avatar_url || undefined,
                });
              }}
            >
              {t('bookings.detail.buttons.contact')}
            </Button>

            {currentMode === 'professional' && (
              <Button 
                variant="outline" 
                fullWidth 
                className="mb-3"
                onPress={handleComplete}
                loading={actionLoading}
                disabled={actionLoading}
              >
                Marcar como Completada
              </Button>
            )}

            <Button 
              variant="ghost" 
              fullWidth
              onPress={handleCancel}
              disabled={actionLoading}
            >
              {t('bookings.detail.buttons.cancel')}
            </Button>
          </>
        )}

        {/* Actions for completed bookings */}
        {booking.status === 'completed' && currentMode === 'client' && (
          <Button variant="primary" fullWidth>
            {t('bookings.detail.buttons.review')}
          </Button>
        )}
      </Container>
    </Screen>
  );
}

