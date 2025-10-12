/** @jsxImportSource nativewind */
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Avatar } from './Avatar';
import { Badge } from './Badge';

export interface BookingCardProps {
  id: string;
  professionalName: string;
  professionalAvatar?: string;
  serviceName: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  price?: string;
  onPress?: () => void;
  onCancel?: () => void;
  onReschedule?: () => void;
  statusLabel?: string;
  rescheduleLabel?: string;
  cancelLabel?: string;
}

export function BookingCard({
  professionalName,
  professionalAvatar,
  serviceName,
  date,
  time,
  status,
  price,
  onPress,
  onCancel,
  onReschedule,
  statusLabel,
  rescheduleLabel = 'Reagendar',
  cancelLabel = 'Cancelar',
}: BookingCardProps) {
  const statusConfig = {
    pending: { variant: 'warning' as const },
    confirmed: { variant: 'success' as const },
    completed: { variant: 'info' as const },
    cancelled: { variant: 'danger' as const },
  };

  return (
    <TouchableOpacity
      className="bg-white rounded-xl p-4 mb-3 border border-gray-100 active:opacity-70"
      onPress={onPress}
    >
      <View className="flex-row items-center mb-3">
        <Avatar
          source={professionalAvatar ? { uri: professionalAvatar } : undefined}
          name={professionalName}
          size="md"
        />
        <View className="flex-1 ml-3">
          <Text className="font-semibold text-gray-900">{professionalName}</Text>
          <Text className="text-sm text-gray-600">{serviceName}</Text>
        </View>
        {statusLabel && (
          <Badge variant={statusConfig[status].variant} size="sm">
            {statusLabel}
          </Badge>
        )}
      </View>

      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center">
          <Text className="text-gray-600 mr-4">📅 {date}</Text>
          <Text className="text-gray-600">🕐 {time}</Text>
        </View>
        {price && (
          <Text className="font-bold text-blue-600">{price}</Text>
        )}
      </View>

      {(status === 'pending' || status === 'confirmed') && (
        <View className="flex-row justify-end gap-2">
          {onReschedule && (
            <TouchableOpacity
              className="px-4 py-2 rounded-lg bg-gray-100"
              onPress={onReschedule}
            >
              <Text className="text-gray-700 font-medium">{rescheduleLabel}</Text>
            </TouchableOpacity>
          )}
          {onCancel && (
            <TouchableOpacity
              className="px-4 py-2 rounded-lg bg-red-50"
              onPress={onCancel}
            >
              <Text className="text-red-600 font-medium">{cancelLabel}</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

export default BookingCard;

